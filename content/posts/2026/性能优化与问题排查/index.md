---
title: "性能优化与问题排查"
date: 2026-06-18
draft: false
categories:
  - 开发
tags:
  - 性能优化
resources:
  - name: featured-image
    src: featured-image.jpg
---

# 全局搜索接口性能优化案例

## 一、问题背景

全局搜索接口 `/rs/sd/global/query/list` 响应时间约 **10 秒**，触发了服务端 10 秒超时限制，前端经常拿不到结果。

该接口采用并行查询架构：前端发起一次搜索请求，后端通过 `CompletableFuture` + `ExecutorService.invokeAll()` 并行调用 **11 个 DAO** 查询不同类型的资产（规则、评分卡、决策表、决策树、公式、矩阵、模型、决策流、参数配置等），汇总后返回。

## 二、排查过程

### 第一步：确认慢在哪

接口层面看不出哪个 DAO 慢，需要用 **Arthas** 在运行时监控每个 DAO 的执行耗时。

使用 Arthas `watch` 命令监控 DAO 层方法执行时间：

```bash
watch cn.com.bsfit.sd.dao.ScorecardQueryDAO list '{params[0].keyword, #cost}' -n 5 '#cost > 100'
```

参数说明：

- `params[0].keyword`：打印入参中的搜索关键词，确认请求内容
- `#cost`：方法执行耗时（ms）
- `-n 5`：只捕获 5 次就停止
- `'#cost > 100'`：条件表达式，只打印耗时超过 100ms 的调用

### 第二步：定位瓶颈——ScorecardQueryDAO 耗时 42 秒

Arthas 输出显示 `ScorecardQueryDAO.list()` 单次执行耗时 **42,000ms**，是整个接口 10 秒超时的元凶。

### 第三步：分析 SQL 瓶颈根因

打开 `SdScoreCardQuery.xml`（MySQL 版），发现 SQL 存在严重问题：

- 原始 SQL 涉及 **7 张表的 LEFT JOIN**，加上 **10 个 GROUP_CONCAT 聚合字段**，以及对应的 GROUP BY
- 检查 `ScorecardResource` 的 DTO 类继承链后发现，这 10 个 GROUP_CONCAT 字段在 DTO 中**完全没有对应的 setter**

**MyBatis 的行为**：查询结果中找不到对应 setter 的列会被**静默丢弃**，不会报错。这意味着数据库做了大量的 JOIN 和 GROUP_CONCAT 聚合运算，结果传回 Java 后直接被丢弃了——**全部是无用功**。

### 第四步：使用 Arthas 进一步确认其他 DAO 的耗时

用同样的方式监控其他 DAO，发现 `RuleQueryDAO` 耗时 ~1s，且被调用了两次（Arthas 显示两个 JDK 动态代理实例）。

## 三、优化方案

### 核心原则

用户明确需求：**按资产 ID、编码、名称进行模糊搜索，只需返回资产本身，无需查出引用该资产的其他资产。**

### 优化 1：ScorecardQueryDAO——从 42 秒降到 65ms

将复杂的多表 JOIN + GROUP_CONCAT 查询简化为单表查询，只 SELECT DTO 中实际有 setter 的字段。从 7 张表 LEFT JOIN + GROUP_CONCAT + GROUP BY 简化为单表查询。

### 优化 2：4 个同类 DAO 存在相同问题

定位到 ScorecardQueryDAO 后，举一反三，主动排查全局搜索中所有 11 个 DAO 的 SQL，发现 **DecisionTableQueryDAO、DecisionTreeQueryDAO、FormulaQueryDAO、MatrixQueryDAO** 都有同样的问题：LEFT JOIN + 聚合函数 + GROUP BY。

对这 4 个 DAO 做了同样的简化：去掉 LEFT JOIN 和 GROUP BY，如需按 sourceCode 搜索则改用 IN 子查询替代。

所有优化同步覆盖 MySQL、Oracle、PostgreSQL、DB2 四种数据库方言。

### 优化 3：顺手修复的 Bug

排查过程中发现并修复了多个已有 Bug：

- PostgreSQL 版 `ScorecardQueryDAO` 的 `titleInclude` 条件错误使用了 `#{keyword}` 而非 `#{titleInclude}`
- Oracle/DB2 版 `ScorecardQueryDAO` 的 WHERE 子句存在重复/损坏内容

## 四、优化效果

| 指标                       | 优化前                       | 优化后      |
| -------------------------- | ---------------------------- | ----------- |
| ScorecardQueryDAO 单次查询 | **42,000ms**                 | **65-95ms** |
| 整体接口响应时间           | **10s+**（超时）             | **2-3s**    |
| 修改涉及 DAO               | 5 个（Scorecard + 4 个同类） | —           |
| 修改 XML 文件数            | 20 个（5 DAO × 4 数据库）    | —           |

## 五、关键收获

1. **Arthas 是生产环境性能排查利器**：不需要重启应用、不需要加日志，直接在运行时观察方法耗时和参数。`watch` 命令的 `#cost` 变量可以精确测量方法执行时间。
2. **MyBatis 的"静默丢弃"陷阱**：当 SQL 查询返回的列在 resultType 对应的 DTO 中没有 setter 时，MyBatis 不会报错，而是静默丢弃。这导致 SQL 做了大量无用运算（JOIN、GROUP_CONCAT、聚合），但结果从未被使用。**一定要审查 SQL 查的每个字段是否真正被 DTO 使用。**
3. **举一反三**：定位到一个模块的问题后，主动排查同架构下所有模块，发现 4 个同类问题一并修复。
4. **需求澄清很关键**：原始 SQL 查了很多关联资产信息（引用的规则名、模型名、特征名等），但用户的实际需求只是按 ID/编码/名称搜资产本身。需求理解偏差导致了过度查询。