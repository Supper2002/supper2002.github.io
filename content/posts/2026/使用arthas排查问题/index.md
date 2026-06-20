---
title: "Arthas 排查性能问题 & OOM 流程指南"
date: 2026-06-20
draft: false
categories:
  - 开发
tags:
  - Arthas
  - 性能优化
resources:
  - name: featured-image
    src: featured-image.jpg
---

# Arthas 排查性能问题 & OOM 流程指南

> Arthas 是 Alibaba 开源的 Java 应用诊断利器，可在不重启应用的情况下，动态监控、排查运行中的 JVM 问题。
> 官网：https://arthas.aliyun.com/

---

## 一、前置准备

### 1. 下载与启动

```bash
# 下载 arthas-boot.jar
curl -O https://arthas.aliyun.com/arthas-boot.jar

# 启动（会列出所有 Java 进程，选择要诊断的进程）
java -jar arthas-boot.jar

# 或者直接指定 PID
java -jar arthas-boot.jar <pid>

# 指定目标 IP（远程访问）
java -jar arthas-boot.jar --target-ip 0.0.0.0
```

### 2. 常用基础命令

| 命令 | 作用 |
|------|------|
| `dashboard` | 实时仪表盘（线程、内存、GC 等） |
| `thread` | 查看 JVM 线程信息 |
| `jvm` | 查看 JVM 详细信息 |
| `sysprop` | 查看系统属性 |
| `sysenv` | 查看环境变量 |
| `help` | 查看命令帮助 |
| `q` / `exit` | 退出 Arthas |

---

## 二、性能问题排查流程

### 场景：接口响应慢、CPU 飙高、系统卡顿

### 🔍 步骤 1：全局概览

```bash
# 实时查看整体情况：线程、内存、GC、运行环境
dashboard
```

**关注点：**
- CPU 使用率是否过高
- GC 次数和时间是否异常
- 哪些线程占用 CPU 高
- 各内存区域使用情况

---

### 🔍 步骤 2：定位高 CPU 线程

```bash
# 查看所有线程，按 CPU 占用排序
thread -n 5
```

**输出示例：**
```
threads total: 200
threadId=58 cpuUsage=85% RUNNABLE
    at com.example.service.OrderService.process(OrderService.java:120)
    ...
```

```bash
# 查看指定线程的详细堆栈
thread 58
```

```bash
# 查看处于 BLOCKED / WAITING 状态的线程（排查死锁、线程饥饿）
thread -b
thread --state BLOCKED
thread --state WAITING
```

---

### 🔍 步骤 3：定位耗时方法

```bash
# 监控某个方法的执行耗时（5秒内，每200ms采样）
trace com.example.service.OrderService process -n 5 --skipJDKMethod true
```

**作用：** 输出方法内部每个子调用的耗时树，一眼看出哪个子方法慢。

```bash
# 方法粒度的性能监控（调用次数、成功率、平均RT、最大RT）
monitor com.example.service.OrderService process -n 10 --cycle 10
```

---

### 🔍 步骤 4：查看方法的实时输入输出

```bash
# watch 方法执行情况：入参、返回值、异常、耗时
watch com.example.service.OrderService process '{params, returnObj, throwExp}' -x 2
```

```bash
# 条件过滤：只观察耗时 > 500ms 的调用
watch com.example.service.OrderService process '{params, returnObj}' '#cost > 500' -x 2
```

```bash
# 观察方法执行前后的对象变化
watch com.example.entity.User update '{target, returnObj}' -x 3
```

---

### 🔍 步骤 5：方法内部调用链路分析

```bash
# 查看方法被哪些地方调用
stack com.example.service.OrderService process -n 5
```

---

### 🔍 步骤 6：反编译确认线上代码

```bash
# 反编译类，确认线上运行的代码与预期一致
jad com.example.service.OrderService
```

---

### 🔍 步骤 7：动态记录性能火焰图（推荐）

```bash
# 生成火焰图（基于 async-profiler）
profiler start
# ... 等待一段时间 ...
profiler stop --format html
```

生成的 HTML 文件可直接在浏览器打开，直观看到 CPU 热点。

---

### ✅ 性能问题排查 Checklist

- [ ] `dashboard` 确认 CPU/内存/GC 是否异常
- [ ] `thread -n 5` 找出最耗 CPU 的线程
- [ ] `trace` 定位到具体慢方法
- [ ] `watch` 确认慢请求的入参/返回值
- [ ] `monitor` 确认是否高频调用导致
- [ ] `profiler` 生成火焰图做深入分析

---

### 🎬 实战案例 1：SDM 指标批量导入导致 CPU 打满 —— 正则回溯

**背景：** SDM 指标管理平台（`bsfit-feature`，端口 `10736`）支持「正则型指标」——业务方在指标上配置一条正则，运行时用它匹配进件/决策报文字段。某次运营用 Excel 批量导入一批新指标，导入流程逐条调 `AssetsRegexManager` 校验并发布正则枚举。任务跑到一半应用 CPU 飙到 95%，Tomcat 线程池（`threads.max=1000`）迅速被打满，连带线上实时决策接口开始超时。

#### Step 1：登入机器，启动 Arthas

```bash
jps -l
# 28391 cn.com.bsfit.feature.BsfitFeatureApplication

java -jar arthas-boot.jar 28391
```

#### Step 2：全局概览 —— `dashboard`

```
dashboard
```
关键发现：
- CPU 95%（G1GC，young gc 频率正常）
- 线程数逼近 1000 上限，RUNNABLE 居多
- 堆内存平稳，没有 OOM 迹象
- → 初判：**业务线程吃 CPU，元凶在某个计算密集方法，不是 GC/内存**

#### Step 3：定位元凶线程 —— `thread -n 5`

```
thread -n 5
```
输出（节选）：
```
threadId=412 cpuUsage=86% RUNNABLE  http-nio-10736-exec-58
    at java.util.regex.Pattern$Curly.match(Pattern.java:4148)
    at java.util.regex.Pattern$GroupHead.match(Pattern.java:4800)
    at java.util.regex.Matcher.find(Matcher.java:691)
    at cn.com.bsfit.sd.feature.helper.manager.AssetsRegexManager.genRegex(AssetsRegexManager.java:82)
    ...
```

**线索浮现：** 栈顶全是 `Pattern` 的回溯帧，调用来自 `AssetsRegexManager`（正则枚举管理器，第 82 行）。

#### Step 4：反编译确认 —— `jad`

```bash
jad cn.com.bsfit.sd.feature.helper.manager.AssetsRegexManager genRegex
```
看到第 82 行附近：
```java
pattern = Pattern.compile(regex);   // regex 是业务方在指标上配的正则，直接 compile，无复杂度校验
```
每条指标校验都会 `compile` 一次（没有按 regex 缓存），且真正的 CPU 杀手是 `compile` 出来的正则在后续 `matcher.find()` 时**灾难性回溯**。

#### Step 5：`watch` 看真实入参，确认是哪条坏正则

```bash
watch cn.com.bsfit.sd.feature.helper.manager.AssetsRegexManager genRegex '{params, #cost}' -x 1 -n 5
```
输出：
```
params=["^(a+)+$"]                  cost=3200ms   ← 经典灾难性回溯正则！
params=["^\\d{4}-\\d{2}-\\d{2}$"]   cost=2ms      ← 正常
```

**真相大白：**
- 业务方在某个指标上配了 `^(a+)+$` 这类**嵌套量词**正则，输入稍长就指数级回溯
- 导入流程逐条校验，命中这条坏正则的样本把单线程卡死 3 秒+
- 并发一上来，Web 线程池被这类请求占满，实时决策接口跟着遭殃

#### Step 6：临时止血 + 长期修复

**临时止血（无需发版）：** 用 Arthas 定位到具体指标，通知业务方改掉该正则；或临时降低导入并发。

**长期修复：**
1. 正则入库前做**回溯复杂度校验**（限制嵌套量词，或用计数兜底中断匹配）
2. `Pattern` 按 regex 缓存，避免重复 `compile`
3. 导入/校验走**独立线程池**，与实时决策接口隔离，避免互相拖垮

#### 📝 复盘要点

> **记忆点：** `thread -n` 栈顶出现连续多帧 `Pattern$Curly.match` / `Pattern$GroupHead.match` = 正则回溯。
> **SDM 高危点：** `AssetsRegexManager`、规则表达式、决策流条件匹配 —— 凡是"业务方可配正则 + 引擎执行"的地方都要防回溯。
> **通用套路：** dashboard 全局 → thread 抓现行 → jad 看代码 → watch 抓坏入参 → 加校验改代码。这个套路几乎能套所有「CPU 飙高 + 接口慢」。

---

### 🎬 实战案例 2：指标列表查询 CPU 飙高 —— 嵌套 stream 线性扫描

**背景：** SDM 指标管理端列表页是最常用的页面之一。后端查出指标分页结果后，会调 `FeatureBusQueryServiceImpl.renderFeatureTaskStatus` 给每个指标渲染「待办任务状态」（发布/审核队列里有没有这条指标的待办）。该方法的实现是：先把所有相关待办任务查出来放进 `List`，再对**每个指标**用 `featureTodoTasks.stream().filter(...).findFirst()` 扫一遍。平时待办队列几十条没感觉，某次上线高峰，待办队列积了 5000 多条，十几个运营同时刷列表页（每页 200 条），200×5000=100 万次字符串比较 × 并发，CPU 直接被打满，列表接口 RT 从 200ms 飙到 5 秒+。

#### Step 1：登入机器，启动 Arthas

```bash
jps -l
# 28391 cn.com.bsfit.feature.BsfitFeatureApplication
java -jar arthas-boot.jar 28391
```

#### Step 2：全局概览 —— `dashboard`

关键发现：
- CPU 85%+，GC 正常，堆内存平稳
- 大量 `http-nio-10736-exec-*` 线程都处于 RUNNABLE，CPU **分散在多个线程**（不像案例 1 只卡在一个线程）
- → 初判：**高频小循环 + 并发，每个线程都在跑纯内存计算，没有明显的单点阻塞**

#### Step 3：定位元凶线程 —— `thread -n 5`

```
thread -n 5
```
输出（节选）：
```
threadId=415 cpuUsage=42% RUNNABLE  http-nio-10736-exec-58
    at cn.hutool.core.util.StrUtil.equals(StrUtil.java:...)
    at cn.com.bsfit.sd.feature.service.impl.FeatureBusQueryServiceImpl.lambda$renderFeatureTaskStatus$3(FeatureBusQueryServiceImpl.java:807)
    at java.util.stream.ReferencePipeline$2$1.accept(...)
    ...
threadId=488 cpuUsage=38% RUNNABLE  http-nio-10736-exec-91
    at cn.hutool.core.util.StrUtil.equals(...)
    at ...FeatureBusQueryServiceImpl.lambda$renderFeatureTaskStatus$3(FeatureBusQueryServiceImpl.java:807)
```
**线索：** 多个线程栈顶都卡在 `StrUtil.equals`，调用点都指向 `renderFeatureTaskStatus` 第 807 行的 lambda —— 典型**高频字符串比较**。

#### Step 4：`trace` 看方法耗时 —— `renderFeatureTaskStatus` 自己吃掉大半 RT

```bash
trace cn.com.bsfit.sd.feature.service.impl.FeatureBusQueryServiceImpl renderFeatureTaskStatus -n 3 --skipJDKMethod true
```
输出显示 `renderFeatureTaskStatus` 整体耗时 3000ms+，而它内部除了开头一次 `getTaskQueueInfoByDataIds`（DB 查询，几十 ms），剩下的时间全耗在那个 `forEach + stream.filter` 上 —— **纯内存计算吃掉了绝大部分时间**。

#### Step 5：`jad` 确认是嵌套线性扫描

```bash
jad cn.com.bsfit.sd.feature.service.impl.FeatureBusQueryServiceImpl renderFeatureTaskStatus
```
看到第 802-807 行：
```java
private void renderFeatureTaskStatus(List<String> featIds, List<GroupFeatureListVO> features) {
    List<SdTaskQueue> featureTodoTasks =
        sdTaskQueueService.getTaskQueueInfoByDataIds(featIds, TaskQueueStatusEnum.TODO);  // 只查一次
    features.forEach(groupFeatureListVo -> {                                              // 外层 N 个指标
        Optional<SdTaskQueue> undoTaskOp = featureTodoTasks.stream()
            .filter(item -> StrUtil.equals(item.getDataId(), groupFeatureListVo.getId())) // 内层扫 M 个待办
            .findFirst();
        ...
    });
}
```
**O(N×M) 线性扫描**：N 个指标，每个都对 M 条待办做一遍 `stream.filter`。N、M 一大，比较次数爆炸。

#### Step 6：`watch` 看入参规模，确认数据量

```bash
watch cn.com.bsfit.sd.feature.service.impl.FeatureBusQueryServiceImpl renderFeatureTaskStatus '{params[0].size(), params[1].size(), #cost}' -x 1 -n 3
```
```
params[0].size()=200    params[1].size()=200    cost=1850ms
params[0].size()=200    params[1].size()=200    cost=2100ms
```
200 个指标、待办队列 5000 条 —— 100 万次 `StrUtil.equals`，难怪慢。

#### Step 7：根因 & 修复

**根因：** `forEach` 里对同一个 `List` 反复 `stream().filter().findFirst()`，本质是 O(N×M) 嵌套遍历；数据量小时无感，待办队列一积压就爆。

**修复（先建 Map 索引，O(N×M) → O(N+M)）：**
```java
private void renderFeatureTaskStatus(List<String> featIds, List<GroupFeatureListVO> features) {
    List<SdTaskQueue> featureTodoTasks =
        sdTaskQueueService.getTaskQueueInfoByDataIds(featIds, TaskQueueStatusEnum.TODO);
    // ★ 先按 dataId 建索引，O(M) 一次
    Map<String, SdTaskQueue> todoMap = featureTodoTasks.stream()
        .collect(Collectors.toMap(SdTaskQueue::getDataId, t -> t, (a, b) -> a));
    features.forEach(groupFeatureListVo -> {
        SdTaskQueue sdTaskQueue = todoMap.get(groupFeatureListVo.getId());   // O(1) 查找
        if (sdTaskQueue != null) {
            groupFeatureListVo.setQueueDetail(new TaskQueueInfoVO()
                .setCreateBy(sdTaskQueue.getCreateBy())
                .setCreateTime(sdTaskQueue.getUpdateTime())
                .setOper(TaskDataOperEnum.getOperNameByCode(sdTaskQueue.getDataOperation())));
        }
        if (!FeatureStatusEnum.DISABLED.getCode().equals(groupFeatureListVo.getEnabled())) {
            groupFeatureListVo.setFailureMessage(null);
        }
    });
}
```
N×M → N+M，RT 从 2000ms 降到几十 ms。

#### 📝 复盘要点

> **记忆点：** `thread -n` 多个线程栈顶都卡在 `StrUtil.equals` / `equals` / `compareTo` + 同一个业务 lambda = 高频字符串/对象比较；`trace` 看到某方法纯内存计算耗时占比极高 = 嵌套遍历。
> **SDM 高危点：** 凡是「循环里对 `List` 做 `stream().filter().findFirst()`」或「循环里 `CollUtil.contains(list, x)`」都是 O(N×M)，典型的有 `renderFeatureTaskStatus`、各类列表渲染关联状态、导入校验里的 `List.contains`。
> **通用套路：** dashboard → thread 抓栈顶（看是不是 equals/比较）→ trace 定位纯内存耗时方法 → jad 看有没有嵌套遍历 → watch 看数据规模 → 加 Map 索引降复杂度。
> **和案例 1 的区别：** 案例 1 是**单次调用卡死**（正则回溯，一条坏正则把一个线程卡 3 秒，栈顶是 `Pattern`）；本案例是**单次调用不慢、但 O(N×M) 累积 + 并发**导致整体 CPU 高（栈顶是 `equals`/业务 lambda）。两者都用 `thread -n` + `trace` 定位，但看的信号不同：案例 1 看栈顶是不是 `Pattern`，本案例看栈顶是不是 `equals`/业务方法。

---

## 三、OOM（OutOfMemoryError）排查流程

### 场景：堆溢出、元空间溢出、直接内存溢出、GC overhead

### 🔍 步骤 1：确认 JVM 启动参数（OOM 时是否生成了 dump）

```bash
jvm
sysprop | grep -i heap
```

**关注关键参数：**
```
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dump
-Xmx / -Xms
-XX:MaxMetaspaceSize
```

---

### 🔍 步骤 2：实时查看内存分布

```bash
# 实时查看各代内存使用情况
dashboard
```

**关注 heap / nonheap / metaspace 是否接近上限。**

```bash
# 查看 JVM 详细内存信息
memory
```

输出示例：
```
Memory used / total / max
heap: 1.5G / 2G / 2G          ← 接近 max，危险
nonheap: 256M / 512M / 0
metaspace: 120M / 200M / 256M
```

---

### 🔍 步骤 3：查看大对象 —— 定位 OOM 元凶

```bash
# 查看堆中对象的统计信息（按对象大小排序）
heapdump --live /tmp/heapdump.hprof
```

```bash
# 使用 arthas 直接分析
# 查看 String、HashMap 等常见嫌疑对象的实例数
ognl '@java.lang.Integer@MAX_VALUE'

# 统计对象数量（hash 碰撞、内存泄漏排查）
profiler start --event alloc
profiler stop --format html
```

---

### 🔍 步骤 4：定位内存泄漏的对象创建源

```bash
# 追踪某个类的对象创建过程（栈）
stack com.example.entity.BigObject <init> -n 10
```

```bash
# 监控某个方法的调用频率（是否有高频创建）
monitor com.example.factory.ObjectFactory create -n 10
```

---

### 🔍 步骤 5：分析 Dump 文件（离线分析，配合 MAT）

```bash
# 生成堆 dump
heapdump /tmp/heapdump.hprof

# 只 dump live 对象（触发 Full GC 后 dump，排除无用对象）
heapdump --live /tmp/heapdump-live.hprof
```

**后续使用工具分析 hprof 文件：**
- **MAT (Memory Analyzer Tool)** — Eclipse 出品，最常用
- **JProfiler / YourKit** — 商业工具
- **jhat** — JDK 自带（较老）

重点查找：**Dominator Tree（支配树）** 中的大对象和 **Leak Suspects（泄漏嫌疑）**。

---

### 🔍 步骤 6：观察 GC 行为（GC overhead 频繁触发）

```bash
dashboard
# 观察 GC 次数和时间：频繁 Full GC = 内存可能已经压满
```

```bash
# 查看 GC 详细统计（需要使用 vmtool 或查看日志）
# 配合 GC 日志分析：-Xlog:gc*=info:file=gc.log
```

---

### 📌 常见 OOM 类型与排查方向

| OOM 类型 | 报错信息 | 根因方向 | 排查手段 |
|---------|---------|---------|---------|
| **Java 堆空间** | `Java heap space` | 内存泄漏 / 大对象 / 堆太小 | `heapdump` + MAT |
| **GC 开销超限** | `GC overhead limit exceeded` | 频繁 GC 但回收很少 | 分析 GC 日志 + dump |
| **元空间溢出** | `Metaspace` | 类加载过多（动态生成） | 检查动态代理 / 反射生成类 |
| **直接内存** | `Direct buffer memory` | NIO / Netty 堆外内存泄漏 | 检查 `DirectByteBuffer` |
| **栈溢出** | `StackOverflowError` | 递归过深 / 栈太小 | `thread` 查看线程栈 |

---

### ✅ OOM 排查 Checklist

- [ ] 确认 OOM 类型（堆 / 元空间 / 直接内存）
- [ ] `memory` 查看当前内存使用
- [ ] `heapdump` 生成 dump 文件
- [ ] 用 MAT 分析 Dominator Tree 和 Leak Suspects
- [ ] `trace` / `stack` 定位大对象创建位置
- [ ] 检查是否为内存泄漏（对象无法回收）vs 内存溢出（瞬时数据量大）
- [ ] 调整 JVM 参数（`-Xmx` / `-XX:MaxMetaspaceSize` 等）

---

### 🎬 实战案例 3：SDM 指标全量导出导致 Java heap space

**背景：** SDM 管理端「导出」功能（`ExportServiceImpl`）把指标配置 + 关联项打成 zip（含 `sdm.json` + Excel），用于环境间迁移。平时导出几千条没问题，某次为迁移生产环境全量导出（数万指标 + 关联明细），点击导出后页面一直转圈，约 2 分钟后 OOM 重启。应用启动参数 `-Xms1g -Xmx8g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError`，dump 落在应用 `gc/` 目录。

#### Step 1：确认是不是 OOM + 拿自动 dump

看应用日志：
```
java.lang.OutOfMemoryError: Java heap space
    at java.util.Arrays.copyOf(Arrays.java:...)
    at java.io.ByteArrayOutputStream.grow(...)
    at cn.com.bsfit.sd.service.impl.ExportServiceImpl.generateExportFile(ExportServiceImpl.java:281)
```
栈帧直接指向 `bos.toByteArray()`。再看 dump 目录：
```bash
ls -lh gc/
# java_pid28391.hprof  6.4G   ← 自动 dump 成功，现场保住了
```

#### Step 2：Arthas 实时确认（重启后复现，或应用还活着时）

```bash
java -jar arthas-boot.jar 28391
memory
```
```
heap: used=7.6G / total=8G / max=8G   ← 顶到上限
```

#### Step 3：必要再 dump 一份 live 对象（低峰操作）

```bash
# ⚠️ 会触发 Full GC + STW，务必业务低峰再做
heapdump --live /tmp/heap-export.hprof
```

#### Step 4：MAT 打开 hprof，看 Leak Suspects / Dominator Tree

```
Problem Suspect 1:
  Thread "http-nio-10736-exec-22" 占用 6.1G (76%)
  ├─ byte[]                 2.8G   ← EasyExcelUtil.writeStream 返回的 excelBytes（整份 Excel）
  ├─ ByteArrayOutputStream  2.6G   ← bos，内含 json + 压缩后的 excel
  └─ ArrayList              0.7G   ← MemoryPageUtil 内存分页前的全量 exportItems
```

**线索：** 整个 zip（JSON + Excel）都攒在内存的 `ByteArrayOutputStream` 里，外加 Excel 的 `byte[]` 和 DB 全量查出的 List，三大对象同时驻留。

#### Step 5：Arthas 验证调用链 —— `stack` + `jad`

```bash
# private 方法 Arthas 也能增强
stack cn.com.bsfit.sd.service.impl.ExportServiceImpl generateExportFile -n 3
jad cn.com.bsfit.sd.service.impl.ExportServiceImpl generateExportFile
```
确认导出逻辑（代码注释自证，这是已优化过的版本）：
```java
ByteArrayOutputStream bos = new ByteArrayOutputStream();
try (ZipOutputStream zos = new ZipOutputStream(bos)) {
    zos.putNextEntry(new ZipEntry("sdm.json"));
    writeJsonToStream(stuff, zos);
    byte[] excelBytes = EasyExcelUtil.writeStream(impExpItems, RelatedItem.class); // ← Excel 整份 byte[]
    zos.putNextEntry(new ZipEntry(fileName + ".xlsx"));
    zos.write(excelBytes);
}
return new ResponseEntity<>(bos.toByteArray(), respHeaders, HttpStatus.OK); // ← 再 copy 一份
```
再看取数（第 389 行）：
```java
exportItems = MemoryPageUtil.page(exportItems, param.getStart(), param.getLimit()); // 先全量查再内存分页
```

#### Step 6：根因 & 修复

**根因（即便代码已从「6 份数据」优化到「约 3 份数据」，注释为证）：**
- `byte[] excelBytes` + `ByteArrayOutputStream bos` + DB 全量 List，三份同时驻留
- 数据量一大，三份叠加直接顶破 8G 堆

**修复方向：**
1. **真流式**：zip 不再走 `ByteArrayOutputStream`，直接写到 `HttpServletResponse.getOutputStream()`，消除 `toByteArray()` 那份拷贝
2. **Excel 边查边写**：`EasyExcel` 分批 `writeSheet`，不一次性 `writeStream` 成大 `byte[]`
3. **DB 真分页**：把 `MemoryPageUtil` 内存分页改成 MyBatis 游标/分页查询，不全量加载
4. **导出异步化**：大导出走后台任务 + 文件下载，不占用 Web 线程

#### Step 7：验证修复效果

发版后压测全量导出，Arthas 实时盯内存：
```bash
dashboard
# 导出过程中 heap 稳定在 2G 以内，不再冲到 8G
```

#### 📝 复盘要点

> **记忆点：** `Java heap space` + 栈在 `ByteArrayOutputStream.grow` / `toByteArray` = "把整份结果攒在内存"。
> **SDM 高危点：** `ExportServiceImpl`、`CommonRuleDownloadServiceImpl`、`MemoryPageUtil` 内存分页、所有 `EasyExcelUtil.writeStream → byte[]` 的导出路径。
> **通用套路：** 看报错栈 → `ls gc/` 拿自动 dump → MAT Dominator Tree 看谁占内存 → `jad` 确认是"攒内存"还是"流式" → 改真流式 + 真分页。
> **重要前置：** JVM 一定要带 `-XX:+HeapDumpOnOutOfMemoryError`，否则 OOM 后无现场可查。

---

## 四、死锁排查流程

死锁分两类：**Java 代码层**（synchronized / Lock 互相等待）和**数据库层**（行锁循环等待）。两者现场很像——"接口大面积卡住、CPU 反而不高"，但排查手段不同。

### 🔍 通用排查思路

**Java 代码层死锁：**
```bash
# 一键找阻塞/死锁（Arthas 自动检测 monitor 死锁，强烈推荐）
thread -b

# 列出所有 BLOCKED 状态的线程
thread --state BLOCKED

# 看指定线程持有/等待的锁
thread <id>
```

**数据库层死锁（PostgreSQL）：**
```sql
-- 看当前会话及其等待状态
SELECT pid, state, wait_event_type, wait_event, left(query,80) AS query
FROM pg_stat_activity WHERE state != 'idle';

-- 看谁阻塞了谁
SELECT pid, pg_blocking_pids(pid) AS blocked_by, left(query,80) AS query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```
应用日志里搜：`deadlock detected` / `DeadlockLoserDataAccessException` / `could not serialize access`。

Arthas 侧辅助：用 `trace`/`stack` 定位持锁时间长的代码和事务边界。

---

### 🎬 实战案例 4a：Java 代码层死锁 —— synchronized 方法持锁做 DB 查询

**背景：** SDM 规则发布时多线程并发调用 `SdRulePkgMapServiceImpl.saveRulePkgMap`（**整个方法是 `synchronized`**）。方法内先 `selectByExample` 查 DB，再 `insert`。某次大批量规则发布，叠加 DB 偶发慢查询，所有保存请求都在等同一把锁，接口大面积超时，但 **CPU 反而很低**（线程全在 BLOCKED）。

#### Step 1：`dashboard` —— CPU 低但接口卡

- CPU 才 15%，但接口大面积超时
- 线程数高，大量 BLOCKED 状态
- → 初判：**不是 CPU/内存问题，是线程在等锁**

#### Step 2：`thread -b` —— 一键找阻塞源

```
thread -b
```
输出：
```
"http-nio-10736-exec-42" Id=42 BLOCKED on cn.com.bsfit.sd.service.impl.SdRulePkgMapServiceImpl@1a2b3c4d
  owned by "http-nio-10736-exec-7" Id=7
    at cn.com.bsfit.sd.service.impl.SdRulePkgMapServiceImpl.saveRulePkgMap(SdRulePkgMapServiceImpl.java:93)
    at org.postgresql.jdbc.PgPreparedStatement.executeQuery(...)   ← 持锁线程卡在 DB 查询
```
**关键信息：** 42 号线程 BLOCKED 等一把锁，锁被 7 号持有，而 7 号正卡在 DB 查询。

#### Step 3：`thread 7` —— 看持锁线程在干嘛

```bash
thread 7
```
确认 7 号线程栈停在 `saveRulePkgMap` 的 `selectByExample`（DB 慢查询）。

#### Step 4：`jad` —— 确认锁粒度

```bash
jad cn.com.bsfit.sd.service.impl.SdRulePkgMapServiceImpl saveRulePkgMap
```
```java
public synchronized void saveRulePkgMap(SdRuleDTO rule) {     // ← 锁住整个实例，覆盖整段方法
    Example example = new Example.Builder(SdRulePkgMap.class)
        .where(...andEqualTo(SdRulePkgMap::getRuleId, rule.getRuleId())).build();
    List<SdRulePkgMap> list = sdRulePkgMapMapper.selectByExample(example); // ← 持锁做 DB 查询
    if (list.isEmpty()) { saveRulePkgMap(rule.getRuleId(), rule.getPkgIds()); }
    else { ... saveRulePkgMap(rule.getRuleId(), addMaps); }                 // ← 持锁做 DB 写入
}
```

#### Step 5：`trace` —— 确认慢在哪步

```bash
trace cn.com.bsfit.sd.service.impl.SdRulePkgMapServiceImpl saveRulePkgMap -n 5
```
显示 `selectByExample` 占了 90% 耗时 —— 慢查询放大了锁持有时间。

#### Step 6：根因 & 修复

**根因：** `synchronized` 锁住整个方法，且锁内做 DB 查询 + 写入；DB 慢查询时锁持有时间膨胀，所有并发请求串行阻塞。

**修复：**
1. **缩小锁粒度**：只锁内存临界区，不要把 DB IO 放进锁内
2. 用细粒度锁（按 `ruleId` 分段锁）替代整实例锁
3. 给 `ruleId` 查询加索引，消除慢查询
4. 高并发场景用数据库唯一约束 + `ON CONFLICT` 替代"先查后插"

#### 📝 复盘要点

> **记忆点：** CPU 低 + 接口卡 + 大量 BLOCKED 线程 = 等锁；`thread -b` 一秒定位阻塞源。
> **SDM 高危点：** 任何 `synchronized` 方法/块内做 DB IO 都要警惕（`SdRulePkgMapServiceImpl`、`PackageDataAuthServiceImpl` 等）。
> **通用套路：** dashboard（CPU 低 + BLOCKED 多）→ `thread -b`（找阻塞源）→ `thread <持锁id>`（看它卡哪）→ `jad`（看锁粒度）→ `trace`（看锁内哪步慢）→ 缩小锁 / 去掉锁内 IO。

---

### 🎬 实战案例 4b：数据库层死锁 —— 手动 REQUIRES_NEW 多表更新

**背景：** SDM 规则构建任务 `RuleBuildTaskServiceImpl.build` 手动开 `REQUIRES_NEW` 事务，事务内依次更新 `sd_rule` 状态表、决策工具状态表、subscription/fldl 表、kar 表（5+ 张表）。某次两个构建任务并发执行，更新同一批表的**顺序不一致**，PostgreSQL 检测到行锁循环等待，抛 `deadlock detected`，其中一个事务被回滚。

#### Step 1：看应用日志 —— 典型的数据库死锁报错

```
org.springframework.dao.DeadlockLoserDataAccessException:
  PreparedStatementCallback; SQL [...]; ERROR: deadlock detected
  Detail: Process 12345 waits for ShareLock on transaction 666, blocked by 67890.
          Process 67890 waits for ShareLock on transaction 777, blocked by 12345.
```
"两个进程互相等待" —— 标准数据库死锁。

#### Step 2：现场抓阻塞会话（若还在死锁窗口）

```sql
SELECT pid, pg_blocking_pids(pid) AS blocked_by, wait_event, left(query,80) AS query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```
看到两个 pid 互相 `blocked_by` 对方。

#### Step 3：Arthas `stack`/`trace` —— 梳理事务边界和更新顺序

```bash
stack cn.com.bsfit.sd.service.impl.RuleBuildTaskServiceImpl build -n 3
```
```bash
trace cn.com.bsfit.sd.service.impl.RuleBuildTaskServiceImpl build -n 3
```
看到事务体内依次调用：
- `changeCommonRulesStatusInTaskQueue` → 更新 `sd_rule`
- `changeDecisionPkgsStatusInTaskQueue` → 更新决策工具表
- `sdBuildService.buildByEffectSubInfo` → 更新 subscription/fldl
- `rulePkgFldlService.syncDcmKar` → 更新 kar 表

#### Step 4：`jad` —— 确认事务传播与多表更新

```bash
jad cn.com.bsfit.sd.service.impl.RuleBuildTaskServiceImpl build
```
```java
DefaultTransactionDefinition def = new DefaultTransactionDefinition();
def.setPropagationBehavior(Propagation.REQUIRES_NEW.value());   // ← 手动开新事务
TransactionStatus status = transactionManager.getTransaction(def);
try {
    commonRuleIds  = changeCommonRulesStatusInTaskQueue(...);    // 更新 sd_rule
    decisionPkgIds = changeDecisionPkgsStatusInTaskQueue(...);   // 更新决策工具表
    sdBuildService.buildByEffectSubInfo(...);                    // 更新 subscription/fldl
    for (String eventId : ...) rulePkgFldlService.syncDcmKar(...); // 更新 kar 表
    transactionManager.commit(status);
} catch (Exception e) {
    transactionManager.rollback(status);
}
```

#### Step 5：根因 & 修复

**根因：** 并发任务以**不同顺序**更新同一批表/行（任务 A 先更 `sd_rule` 再更 `kar`，任务 B 先更 `kar` 再更 `sd_rule`），形成行锁循环等待 → 死锁。

**修复：**
1. **统一多表/多行更新顺序**：所有并发路径对同一批资源按固定顺序更新（最有效）
2. 对热点行先**排序**再更新，避免交叉等待
3. **缩小事务范围**：把不需要事务保护的步骤移出，减少持锁时间
4. 降低构建并发度（调小 `SdBuildServiceImpl` 的并行编译线程池）
5. PostgreSQL 设置合理 `lock_timeout`，让死锁快速失败 + 重试

#### 📝 复盘要点

> **记忆点：** 应用日志出现 `deadlock detected` / `DeadlockLoserDataAccessException` = 数据库层死锁。
> **SDM 高危点：** 凡是手动事务（`REQUIRES_NEW` / `TransactionTemplate`）+ 多表更新 + 并发的场景（`RuleBuildTaskServiceImpl`、`WorkflowBuildServiceImpl.dealTask`、版本发布/审核流程）。
> **通用套路：** 看应用日志报错 → `pg_stat_activity` 抓互相阻塞的会话 → `jad`/`trace` 梳理事务内多表更新顺序 → 统一加锁顺序 / 缩事务 / 降并发。
> **Java 层 vs DB 层：** Java 死锁看 `thread -b`（CPU 低 + BLOCKED），DB 死锁看日志 `deadlock detected` + `pg_stat_activity`，两者别搞混。

---

## 五、其他高频排查场景

### 1. 类是否被加载 / 是否加载了正确的版本

```bash
# 查找已加载的类
sc -d com.example.service.OrderService

# 查看类加载器
sc -d -c <classloader-hash> com.example.service.OrderService
```

### 2. 动态修改日志级别（无需重启）

```bash
# 动态打开 DEBUG 日志
ognl '@org.apache.logging.log4j.core.config.LoggerConfig@setLevel(...)'

# logback 示例
ognl '@ch.qos.logback.classic.Logger@setLevel'
```

### 3. 查看 Spring Bean 的真实值

```bash
# 通过 Spring 上下文获取 Bean 的字段值
ognl '#context=@org.springframework.web.context.ContextLoader@getCurrentWebApplicationContext(),
       #userDao=#context.getBean("userDao"),
       #userDao.dataSource.url' -x 2
```

### 4. 方法耗时趋势监控

```bash
# 持续监控（每 10s 统计一次）
monitor com.example.service.OrderService process -c 10
```

### 5. 查找耗时方法（无法定位时）

```bash
# 自动采样 CPU，列出热点方法
profiler start --duration 30
profiler getSamples
profiler stop --format html
```

---

## 六、生产环境使用注意 ⚠️

1. **`trace` / `watch` 等会有性能开销**，排查完务必及时停止（`-n` 限制次数）
2. **`heapdump --live` 会触发 Full GC**，业务高峰期慎用
3. **避免高频调用**复杂 OGNL 表达式，会影响目标 JVM
4. **使用完毕务必 `stop`**，彻底卸载 Arthas 增强过的类
5. **权限管控**：Arthas 可执行任意代码，生产环境需控制访问
6. **优先 dump + 离线分析**，减少对在线应用的影响

```bash
# 彻底退出并卸载（重要！）
stop
```

---

## 七、常用命令速查表

| 场景 | 命令 |
|------|------|
| 看 CPU 热点线程 | `thread -n 5` |
| 看线程堆栈 | `thread <id>` |
| 看死锁/阻塞源 | `thread -b` |
| 列出 BLOCKED 线程 | `thread --state BLOCKED` |
| DB 层死锁 | `SELECT pid, pg_blocking_pids(pid) FROM pg_stat_activity` |
| 方法耗时树 | `trace 类 方法` |
| 方法监控统计 | `monitor 类 方法` |
| 方法入参返回值 | `watch 类 方法 '{params,returnObj}'` |
| 调用链 | `stack 类 方法` |
| 反编译 | `jad 类` |
| 内存概况 | `memory` |
| 堆 dump | `heapdump /tmp/x.hprof` |
| 火焰图 | `profiler start` / `profiler stop` |
| 退出卸载 | `stop` |

---

## 八、完整流程图（文字版）

### 性能问题流程
```
dashboard (全局概览)
    │
    ├─ CPU 高 → thread -n 5 → 定位线程 → trace/watch 定位方法
    │
    ├─ GC 频繁 → memory 查看 → heapdump 分析大对象
    │
    └─ 接口慢 → trace 定位耗时方法 → watch 观察参数
                  └─ profiler 生成火焰图
```

### OOM 流程
```
确认 OOM 类型 (报错信息)
    │
    ├─ Java heap space
    │     └─ memory 查看 → heapdump → MAT 分析 Dominator Tree
    │           └─ stack/trace 定位大对象创建位置
    │
    ├─ Metaspace
    │     └─ sc 查看加载的类 → 检查动态代理/反射
    │
    ├─ Direct buffer memory
    │     └─ 检查 Netty/NIO 的 ByteBuf 分配与释放
    │
    └─ GC overhead
          └─ 分析 GC 日志 → 检查内存泄漏 vs 配置过小
```

### 死锁流程
```
dashboard: CPU 低 + 接口卡 + BLOCKED 线程多
    │
    ├─ Java 代码层死锁
    │     └─ thread -b 找阻塞源 → thread <持锁id> 看它卡哪
    │           → jad 看锁粒度 → trace 看锁内慢操作 → 缩小锁/去锁内 IO
    │
    └─ 数据库层死锁 (日志: deadlock detected)
          └─ pg_stat_activity 抓互相阻塞会话
                → jad/trace 梳理事务内多表更新顺序 → 统一加锁顺序/缩事务/降并发
```

---

**参考资源：**
- 官方文档：https://arthas.aliyun.com/doc/
- 命令大全：https://arthas.aliyun.com/doc/commands.html
- 在线教程：https://arthas.aliyun.com/doc/arthas-tutorials.html
