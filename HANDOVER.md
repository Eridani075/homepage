# Guide Website - 个人云原生网关控制台交接文档

## 1. 项目概述

本项目是一个高度现代化、具备惊艳视觉表现力的**个人私有云/Homelab 服务导航网关（Dashboard）**。
有别于传统的静态导航页，本项目主打**“动态、流体、极客与优雅”**的融合体验。其最大特色在于深度集成了 **Material Design 3 (Material You)** 的色彩提取引擎，能够根据用户上传的壁纸（图片或视频）动态生成全局 UI 的色彩主题，并实现了深色/浅色模式的完美适配。

## 2. 技术栈与框架选型

*   **核心框架**：React 18 + Vite (极速构建与热更新)
*   **样式方案**：纯原生 Vanilla CSS + 全局 CSS Variables (完全摒弃重量级组件库，追求极致的定制自由度与玻璃拟物化质感)
*   **色彩引擎**：`@material/material-color-utilities` (Google 官方提供的 M3 HCT 色彩空间算法引擎，实现壁纸取色与动态调色盘生成)
*   **图标库**：`lucide-react` (轻量级、风格统一的精美 SVG 图标库)
*   **颜色拾取器**：`@jaames/iro` (高度可定制的色彩轮盘，用于手动调节基础色)
*   **数据持久化**：原生 `localStorage` (后续可无缝迁移至 `localforage` 或后端 API)

## 3. 核心功能与架构设计

### 3.1 动态壁纸与色彩引擎 (Dynamic Theming)
*   **实现机制**：通过 `App.jsx` 中的 `extractColorFromImage` 和 `extractColorFromVideo` 方法，读取媒体像素数据，利用 M3 算法提取主色调 (Base Color)，随后生成多达 10 余种 UI 角色色（Primary, Surface, Outline, Container 等）。
*   **全局响应**：色彩引擎生成 16 进制颜色后，通过 `document.documentElement.style.setProperty` 动态注入为全局 CSS 变量（如 `--primary`）。整个 DOM 树的样式会瞬间响应色彩重绘。
*   **主题方案扩展**：除了基础色彩，还支持切换不同的 Material 3 算法预设，如 `TONAL_SPOT`（柔和单色）、`VIBRANT`（高饱和鲜艳）、`EXPRESSIVE`（极具张力的色彩偏移）等。

### 3.2 布局与核心组件
*   **Hero Section**：页面顶部的个性化签名与天气/时间展示区，支持“卡片化 (Card)”与“极简 (Minimal)”两种形态切换。
*   **AppGrid 服务矩阵**：网格化的应用卡片展示区，具备极致流畅的 CSS 悬浮动效。
*   **Uptime 联动视效**：悬浮应用卡片时，内容区会无缝上滑隐藏，底部则浮现类似 Uptime Kuma 的绿色连通性时间轴特效（前端视觉已完全闭环，等待后端数据接入）。
*   **TopBar 与胶囊控制栏**：位于右上角，融合了暗黑模式切换和系统设置入口，采用 Apple 风格的灵动胶囊展开动效。

### 3.3 全局编辑模式 (Edit Mode)
*   系统不仅是展示页，更是管理后台。通过点击胶囊菜单内的“编辑”图标可进入全局管理状态。
*   **Add Card Modal (添加卡片弹窗)**：
    *   纯正 Material 3 Expressive 风格的沉浸式悬浮弹窗。
    *   内置完整的 `iconMap` 图标选择器（支持近 40 种图标快速选用）。
    *   包含符合 M3 规范的开关 (Toggle Switch) 与极具质感的交互按钮。

## 4. 技术细节与实现亮点

*   **纯手工打磨的组件**：比如 iOS / M3 风格的 Toggle 切换开关、带有物理沉浸反馈的按钮、毛玻璃 (Glassmorphism) 效果的面板，全部通过基础的 CSS `box-shadow`、`backdrop-filter`、`transform` 等属性精心调配得出，拒绝第三方 UI 库的臃肿。
*   **防御性 CSS 变量设计**：为了应对动态色彩引擎在极端情况下（如版本 API 变动、网络阻塞）未下发某些变量的风险，所有的 CSS 都遵循了兜底原则。例如：`background-color: var(--surface-container-highest, #E6E0E9);`，这保证了 UI 永远不会因为颜色丢失而变为不可见的透明状态。
*   **中心化图标映射**：为了让配置数据（JSON）能够被持久化保存，同时又能渲染 React 组件图标，项目中引入了 `iconMap.js`，将文本键值（如 `"Globe"`）映射为具体的 `lucide-react` 组件引用，巧妙解决了数据结构与 React 节点的隔离问题。

## 5. 后续开发与交接注意事项

1.  **关于 CSS 变量的维护**：
    由于我们的组件深度绑定了 M3 色彩规范，如果后续要新增自定义颜色（比如 Warning、Success 色系），必须在 `App.jsx` 的 `updateTheme` 函数中，通过 `scheme` 获取并注入到 DOM。**切记一定要在 `index.css` 的 `:root` 和 `.dark` 选择器中写好同名变量的静态 fallback 颜色！**
2.  **Uptime Kuma 的数据对接**：
    目前 `AppGrid.jsx` 中的应用卡片悬浮状态 (`uptime-container`) 仅为视觉占位。后续实施对接时，需要将应用的 ID 传给后端或 Uptime Kuma 接口，获取真实的在线状态数组，并映射为绿色/红色的小竖条进行渲染。
3.  **拖拽重排功能 (Drag & Drop)**：
    目前 `task.md` 中已经规划了原生 HTML5 的拖拽重排功能，如果后续要继续实现，推荐在 `AppGrid.jsx` 的应用循环映射中加入 `draggable={true}`，并通过管理 `dragStart` 和 `dragOver` 的事件状态来更新 `cards` 数组。
4.  **持久化存储升级**：
    目前配置保存在 `localStorage`。如果应用配置日益增多，或者想要添加云端备份功能，建议使用已经在依赖中的 `localforage`，或者通过 Axios 接口将卡片 JSON 结构提交给后端的 Node.js / Go 服务进行存储。

---
*文档生成于：2026年6月19日*
