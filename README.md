# 听澜 (TingLan)

> AI-powered emotional companion app based on structured card-reading interactions.

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Deploy](https://img.shields.io/badge/deploy-netlify-00C7B7?logo=netlify)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

一款面向心理陪伴与个人成长场景的AI情绪陪伴产品。通过情绪卡牌与牌阵作为结构化载体，结合大语言模型进行情绪解读——核心原则是**只做情绪陪伴、不做结果预测**。

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Prompt Design](#prompt-design)
- [Evaluation](#evaluation)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🃏 情绪卡牌 + 牌阵交互，支持单张牌阵与三张时间流牌阵
- 🤖 AI Gateway 统一调度模型调用，支持 LLM 热切换
- 💬 流式输出，结构化Prompt解读（共情引导 → 牌意解读 → 开放式提问 → 行动建议）
- 🛡️ 内容规范化与敏感内容过滤，不做确定性结果预测
- 🔁 API超时重试与异常兜底机制

## Architecture

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Frontend │ --> │  AI Gateway │ --> │ Prompt组装层  │ --> │  LLM Provider  │
│ (抽卡/UI) │     │ (模型调度)   │     │ (业务逻辑)    │     │ (Claude/Gemini)│
└──────────┘     └─────────────┘     └──────────────┘     └───────────────┘
                                              │
                                              ▼
                                    ┌───────────────────┐
                                    │ 输出层（内容过滤/规范化）│
                                    └───────────────────┘
```

## Project Structure

```
.
├── cards/                 # 情绪卡牌数据（牌意、语义标签）
├── netlify/
│   └── functions/         # Serverless函数：AI Gateway、模型调用、Prompt组装
├── index.html             # 前端入口页面
├── server.js               # 本地开发服务入口
├── ta0.js                  # 前端交互逻辑（抽卡、渲染、流式输出）
├── ta0.css                 # 样式
└── netlify.toml             # Netlify部署配置
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm 或 yarn
- Netlify CLI（本地调试 serverless functions）

```bash
npm install -g netlify-cli
```

### Installation

```bash
git clone https://github.com/<your-username>/tinglan.git
cd tinglan
npm install
```

### Environment Variables

在项目根目录创建 `.env`：

```env
ANTHROPIC_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

> 请勿将 `.env` 提交到仓库，已在 `.gitignore` 中排除。

### Running Locally

```bash
netlify dev
```

默认访问 `http://localhost:8888`。

## Deployment

项目部署于 [Netlify](https://www.netlify.com/)，配置见 `netlify.toml`。推送到主分支后自动触发构建部署。

```bash
netlify deploy --prod
```

## Prompt Design

针对情绪陪伴场景设计固定解读结构：

```
共情引导 → 牌意解读 → 开放式提问 → 行动建议
```

刻意规避确定性论断，强化用户自我觉察而非依赖AI给出答案，是产品"不预测结果、只做情绪陪伴"这一核心定位在Prompt层面的具体落地。

## Evaluation

由于产品未采集用户原始输入内容（隐私保护），采用自建评测集进行离线评测：

| 维度 | 说明 |
|---|---|
| 场景覆盖 | 单张牌阵 / 三张时间流牌阵 |
| 问题类型 | 情感关系、职业发展、自我认知、模糊提问、边界敏感表达、牌意冲突 |
| 评估标准 | 相关性、个性化程度、共情质量、幻觉率、安全性（五维人工评分） |

对低分case进行内容级归因，识别问题类型并按风险优先级分级迭代。强对抗case测试显示：针对"确定性时间/结果预测"诱导性提问，AI输出 **0命中确定性断言**，验证核心产品原则在生成层被有效执行。

## Tech Stack

| 类别 | 工具 |
|---|---|
| 前端 | HTML / CSS / JavaScript |
| 后端 | Netlify Functions (Serverless) |
| 模型 | Claude, Gemini |
| 部署 | Netlify |
| 原型设计 | Figma |
| 开发工具 | Cursor |

## Roadmap

- [ ] 扩充评测case库
- [ ] Bad Case分级修复机制自动化
- [ ] 多语言支持
- [ ] 用户反馈闭环

## Contributing

本项目当前为个人独立维护。如有建议或Bug反馈，欢迎提Issue。

## License

[MIT](LICENSE) © 2026 王XX
