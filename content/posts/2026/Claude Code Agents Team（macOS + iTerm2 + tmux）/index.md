---
title: "AI技术分享：Claude Code Agents Team"
date: 2026-04-19
draft: false
categories:
  - 工作
tags:
  - AI
  - 技术分享
resources:
  - name: featured-image
    src: featured-image.jpg
---

# Claude Code 与 OpenCode（on-my-opencode）使用指南与深度对比  

**专为 macOS + iTerm2 + tmux 用户打造**  
**重点：Agent Teams 模式 vs OpenCode 多 Agent 系统**

> 更新日期：2026 年 4 月  
> 适用场景：你希望获得**真实多窗口分屏、可随时 resume** 的 AI 团队开发体验，同时关心**多模型支持**、**团队规划**与**驱动能力**。

---

## 1. Claude Code 启动与日常使用（推荐工作流）

### 1.1 全局基础配置（`~/.claude/settings.json`）
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "teammateMode": "tmux",
  "permissions": {
    "defaultMode": "auto"
  }
}
```

### 1.2 项目级权限推荐（项目根目录 `.claude/settings.json`）
```json
{
  "permissions": {
    "allow": [
      "Read", "Edit",
      "Bash(npm *)", "Bash(yarn *)", "Bash(pnpm *)",
      "Bash(git *)", "Bash(make *)", "Bash(cargo *)",
      "Bash(python *)", "Bash(node *)", "Bash(ls *)", "Bash(cat *)"
    ],
    "ask": ["Bash(rm -rf *)", "Bash(sudo *)", "Bash(git push --force *)"]
  }
}
```

### 1.3 推荐启动命令（每个项目独立 tmux session）
```bash
# 最推荐：带意义的名字
tmux new-session -s feature-hzbank-team "claude"

# 或自动用当前目录命名
tmux new-session -s "claude-$(basename "$(pwd)")" "claude"
```

启动后 Claude 会自动进入 **Agent Teams** 模式：  
- Team Lead（主 pane）  
- 根据 prompt 自动创建多个 Teammates（每个占一个 tmux pane）  
- 支持实时分屏查看所有 Agent 输出

**iTerm2 优化**：使用 `tmux -CC` 可让 iTerm2 接管 pane，视觉体验更好。

### 1.4 核心 tmux 操作（实现完美 resume）
- **Detach**：`Ctrl + b` 然后 `d`
- **恢复多窗口**：`tmux attach -t feature-hzbank-team`
- **切换 session**：`Ctrl + b` 然后 `s`（列表选择）
- **干净关闭团队**：在 Lead pane 输入 `Clean up the team and shut down all teammates.`
- **配置修改后重启**：`tmux kill-session -t xxx && tmux new-session -s xxx "claude"`

**最大优势**：Claude Code 进程退出后，tmux session 依然保留，随时 attach 即可恢复完整分屏 + 历史输出。

### 1.5 Bash 命令自动执行
- **实时切换**：按 **Shift + Tab** 循环至 `auto` 模式（当前 session 立即生效）
- **永久默认**：设置 `defaultMode: "auto"` 并重启 session
- Auto Mode 会用分类器判断：常规操作直接执行，危险操作仍会阻挡

---

## 2. Claude Code Agent Teams 模式使用要点

- **创建团队示例**：
  
  ```
  Create an agent team: Team Lead (Opus), Backend Architect (Sonnet), Frontend Engineer (Sonnet), Tester (Sonnet). 
  We are building the hzbank feature. Use shared task list and let teammates communicate directly.
  ```
  
- 我目前使用的:
  
  ```
  Create an agent team: Team Lead (Opus), Backend Architect (Sonnet),Backend Engineer (Sonnet), Tester (Sonnet). 
  Use shared task list and let teammates communicate directly.
  Please use Chinese for the subsequent conversation.
  ```
  
- **模型分层**：可在 prompt 中指定不同 Claude 模型（Opus 用于架构，Sonnet 用于实现），但**无法混用非 Anthropic 模型**（如 GLM-5.1 + MiniMax-2.7）。

- **团队规划与驱动**：原生支持 **Shared Task List**、任务认领、Teammates 之间 peer-to-peer 消息传递。Lead 负责高层协调，整体收敛较快，像一个真实的小型工程团队。

---

## 3. 与 OpenCode（on-my-opencode）的深度对比

OpenCode 是开源、provider-agnostic 的 AI coding agent，支持 75+ 模型提供商（含本地 Ollama），社区活跃（GitHub 10万+ stars）。它通过自定义 Agent 配置和插件（如 oh-my-opencode）实现 multi-agent 功能。

### 3.1 核心维度对比表

#### 3.1.1 Grok实时对比

| 维度                        | Claude Code Agents Team                                      | OpenCode (on-my-opencode) + oh-my-opencode                  | 谁更强？ |
|-----------------------------|-------------------------------------------------------------|------------------------------------------------------------|----------|
| **多模型支持**              | 仅 Anthropic 家族内 tiering（Opus/Sonnet/Haiku）            | **原生强支持**：每个 Agent 可独立绑定 GLM-5.1、MiniMax-2.7、本地模型等 | **OpenCode 完胜** |
| **多窗口分屏体验**          | **原生 tmux 自动分屏**，每个 Teammate 一个真实 pane         | 需要手动 tmux 或 TUI 辅助，分屏体验较弱                    | **Claude 胜** |
| **Resume 多窗口能力**       | **极强**：tmux session 永久保留，随时 attach 恢复           | 较弱，重启后需重新启动团队                                 | **Claude 胜** |
| **团队规划能力**            | **更强**：原生 Shared Task List + 依赖跟踪 + 任务认领       | 支持 hierarchical planning，但需自定义配置或插件实现       | **Claude 略胜** |
| **驱动团队（Orchestration）** | **更自然**：peer-to-peer 通信 + Lead 协调 + 自治性高        | 灵活（可编程 orchestration），但原生团队感较弱             | **Claude 胜**（开箱即用） |
| **Agent 间协作**            | 原生消息传递 + 共享任务清单                                 | 支持，但更依赖配置和插件                                   | Claude 更 polished |
| **成本与隐私**              | 付费订阅，云端执行                                          | **免费/本地优先**，成本更低，隐私更好                      | **OpenCode 胜** |
| **配置难度**                | 低（prompt + settings）                                     | 中等（需定义 Agent YAML、模型绑定）                        | Claude 更简单 |
| **整体团队体验**            | “像开真实团队会议”，并行可见性强，收敛较快                 | “可高度定制的 Agent 编排系统”，上限更高                   | 看偏好 |

#### 3.1.2 gemini 对比



| **维度**       | **Claude Code (Agents Team)**                                | **on-my-opencode (omo)**                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **交互哲学**   | **指挥官模式**：实时、并行的终端分屏交互，强调对执行过程的即时掌控。 | **自动驾驶模式**：任务驱动的流水线协作，强调任务的分层编排与最终交付。 |
| **多代理架构** | **基于 `tmux` 窗格**：每个 Agent 占用一个独立的 TTY 窗口，物理感强。 | **基于 Orchestrator (Atlas/Sisyphus)**：通过内部逻辑路由任务，界面更统一。 |
| **模型支持**   | **单供应商**：原生仅支持 Anthropic (Claude 3.5/3.7)，稳定性高但配额受限。 | **多供应商混用**：支持任意模型组合（如 DeepSeek 写码 + Claude 规划 + Ollama 运行）。 |
| **API 稳定性** | **敏感**：并发请求极易触发国产模型（如 MiniMax）的并发频率限制。 | **抗压性强**：内置任务队列与请求限流（Rate-limiting），更适合处理 API 波动。 |
| **本地集成**   | **深度系统集成**：直接共享宿主机的 Shell、环境变量、Git 及本地文件。 | **容器化/隔离**：更倾向于在受控环境或沙箱中运行，安全性更高。 |
| **扩展性**     | **MCP 协议驱动**：通过标准的 Model Context Protocol 接入第三方工具。 | **插件/钩子系统**：除了 MCP，还支持丰富的 Hooks、Skills 及 Category 任务路由。 |
| **窗口管理**   | **原生/Tmux**：依赖终端模拟器（iTerm2）的渲染，配置不当易产生嵌套错误。 | **Web/IDE/Tmux**：支持 Web 画布、IDE 插件或单 Session 内部集成。 |
| **任务持久化** | **会话级**：关闭终端可能丢失未完成的 Agent 交互上下文。      | **项目级**：支持任务状态持久化，可随时跨 Session 恢复执行。  |



### 3.2 实际使用感受总结

- **Claude Code Agents Team**：
  - **优势**：开箱即用的**真实多窗口团队协作** + **优秀团队规划与驱动** + **完美 tmux resume**。适合复杂项目、需要实时监控多角色并行的场景。社区反馈其 orchestration 更 polished，收敛速度较快。
  - **局限**：模型选择受限（无法轻松混用 GLM + MiniMax），成本较高。

- **OpenCode**：
  - **优势**：**模型自由度极高**（不同 Agent 用不同模型）、成本可控、隐私更好。结合 oh-my-opencode 等插件后，可实现类似 multi-agent orchestration，上限很高。
  - **局限**：默认单 TUI 界面，多窗口分屏和 resume 体验不如 Claude 原生，需要更多手动配置。

**一句话决策建议**：
- 优先**分屏体验 + 团队规划驱动 + 省心** → **Claude Code + tmux**
- 优先**多模型混用 + 成本控制 + 灵活定制** → **OpenCode（推荐搭配 oh-my-opencode）**

很多开发者采用**混合策略**：复杂协调用 Claude Code，成本敏感或需要特定模型的任务切换到 OpenCode。

---

## 4. 实用建议与下一步

- **如果你继续用 Claude Code**：重点优化 prompt 中的角色定义和模型分层，配合 auto 模式 + tmux 脚本实现一键启动/重启。
- **如果你想尝试 OpenCode**：可快速安装并配置多模型 Agent，结合 tmux 手动模拟分屏。
- **长期推荐**：根据项目类型切换工具（简单任务用 OpenCode 省钱，复杂团队任务用 Claude Code 体验更好）。

---

**需要补充的内容**：
- OpenCode 详细安装 + 多模型 Agent 配置示例
- Claude Code 高级团队规划 prompt 模板
- 一键启动脚本（同时支持两种工具）
- 特定项目（如 hzbank）的配置建议

```
1.先运行
 tmux -CC new -s claude-team

2.启动多窗口模式
claude --teammate-mode tmux --dangerously-skip-permissions
```

