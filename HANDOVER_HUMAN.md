# Guide Website - 个人云原生网关控制台交接文档 (Human Readable)

## 1. 项目概述

本项目是一个高度现代化、具备惊艳视觉表现力的**个人私有云/Homelab 服务导航网关（Dashboard）**。
有别于传统的静态导航页，本项目主打**“动态、流体、极客与优雅”**的融合体验。其最大特色在于深度集成了 **Material Design 3 (Material You)** 的色彩提取引擎，能够根据用户上传的壁纸（图片或视频）动态生成全局 UI 的色彩主题，并实现了深色/浅色模式的完美适配。在最新的开发中，项目进一步完善了全局设置面板与完全可交互的“编辑模式（Edit Mode）”。

## 2. 技术栈与框架选型

*   **核心框架**：React 18 + Vite (极速构建与热更新)
*   **样式方案**：纯原生 Vanilla CSS + 全局 CSS Variables (完全摒弃重量级组件库，追求极致的定制自由度与玻璃拟物化质感，拒绝 Tailwind 的标签污染)
*   **拖拽排序**：`@dnd-kit/core` + `@dnd-kit/sortable` (用于取代传统的 react-beautiful-dnd，提供轻量且高度可控的流式网格拖拽排序能力)
*   **色彩引擎**：`@material/material-color-utilities` (Google 官方提供的 M3 HCT 色彩空间算法引擎，实现壁纸取色与动态调色盘生成)
*   **图标库**：`lucide-react` (轻量级、风格统一的精美 SVG 图标库)
*   **颜色拾取器**：`@jaames/iro` (高度可定制的色彩轮盘，用于手动调节基础色)
*   **数据持久化**：原生 `localStorage` 及 `localforage` (处理卡片、系统设置、媒体大文件的本地缓存机制)

## 3. 核心功能与架构设计

### 3.1 动态壁纸与色彩引擎 (Dynamic Theming)
*   **实现机制**：通过 `App.jsx` 读取媒体数据，利用 M3 算法提取主色调 (Base Color)，自动映射出多达 10 余种 UI 角色色（Primary, Surface, Outline, Container 等）。
*   **主题方案扩展**：支持切换不同的 Material 3 算法预设，如 `TONAL_SPOT`（柔和单色）、`VIBRANT`（高饱和鲜艳）、`EXPRESSIVE`（极具张力的色彩偏移）等。

### 3.2 布局与核心组件
*   **Hero Section**：页面顶部的个性化展示区。现已支持“大号悬浮卡片式 (Card)”与“极简无边界 (Minimal)”两种展示风格。用户可随时在后台切换。
*   **AppGrid 服务矩阵**：网格化的应用卡片展示区，具备极致流畅的 CSS 悬浮动效。通过 `dnd-kit` 实现了基于碰撞检测的二维网格拖拽功能。
*   **Uptime 联动视效**：卡片悬浮时触发 Uptime Kuma 风格状态轴，且可以通过后台单独开关“Uptime 监控悬浮动效”的渲染。
*   **社交媒体面板 (Social Settings)**：可增删改查页面头部的社交账号外链，面板进行了左右双栏响应式设计（PC/Pad横排，手机自动竖排）。

### 3.3 全局编辑模式 (Edit Mode)
系统不仅是展示页，更是灵活的管理后台：
*   **拖拽重排**：进入编辑模式后，卡片变成可抓取的幽灵状态（Dragging），支持自由排序。
*   **卡片修改与添加弹窗**：具备卡片增、删、改功能，支持丰富的 Lucide 图标可视化选择，纯正的 M3 拟物表单设计。
*   **全局设置 (Admin Modal)**：支持全局界面布局的调整、主题色彩的管理、社交媒体的修改等。

## 4. 技术细节与 UI/UX 亮点

*   **克制的极简动效 (Minimalist Animations)**：
    *   在开发中不断精简“缩放/弹跳 (scale/bounce)”等容易引起视觉疲劳和重绘卡顿的重度动画。
    *   模态框的出现、下拉框 (CustomSelect) 的展开、卡片的拖拽态均统一采用了**仅改变 opacity 与极微量 translateY 的纯浮现过渡 (FadeIn)**，杜绝了无谓的 `scale` 导致的不稳定感。
*   **中心化图标映射**：为了让配置数据被持久化保存，引入了 `iconMap.js` 与 `socialIconMap.js`，将 JSON 文本巧妙转换为 React 组件节点。
*   **完美对齐的间距哲学**：所有的表单内嵌卡片（如 Uptime 开关卡片）、自定义下拉框、社交卡片，其 padding、border-radius 均经过严苛的 1:1 像素级打磨以保持完全一致的 M3 设计语言。

## 5. 后续开发与交接注意事项

1.  **关于 CSS 变量的维护**：
    由于我们的组件深度绑定了 M3 色彩规范，如果后续要新增自定义颜色，必须在 `App.jsx` 的 `updateTheme` 中获取并注入到 DOM。**切记一定要在 `index.css` 的 `:root` 和 `[data-theme="dark"]` 中写好静态 fallback 颜色！**
2.  **Uptime Kuma 的数据对接**：
    目前视觉前端已全部闭环完毕（连动画开关都有了）。后续实施对接时，只需将应用的 URL 或 ID 传给后端或 Uptime Kuma 接口，替换现有的 mock `appDots` 数据即可。
3.  **持久化存储升级**：
    目前的复杂表单结构保存在 `localStorage` 中。随着后续模块继续增多，为了保证性能，建议全面切向 `localforage` 或云端数据同步后端接口。

---
*文档生成于：2026年6月19日*
