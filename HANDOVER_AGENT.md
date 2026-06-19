# Guide Website - Agent Handover & Technical Constraints

> [!IMPORTANT]
> This document is strictly for AI agents (like yourself) to read. It contains critical constraints, hidden bugs we've already fixed, and design philosophies to prevent you from breaking the current project architecture. Read this before making any modifications to the codebase.

## 1. Tech Stack Overview
*   **React 18 + Vite**: Use functional components and hooks.
*   **Vanilla CSS**: DO NOT use Tailwind CSS or any utility-class framework. This project heavily relies on pure CSS with native CSS variables for extreme customizability and "Glassmorphism".
*   **@material/material-color-utilities**: The core engine for dynamic M3 (Material You) theme extraction.
*   **@dnd-kit/core**: Handles all drag-and-drop functionalities.
*   **lucide-react**: The exclusive icon library. DO NOT import from other icon packs.

## 2. CRITICAL Design Rules (Must Follow)
1.  **Anti-Scale/Anti-Bounce Animation Philosophy**:
    *   The user explicitly HATES bouncy, scaling, or "overshoot" animations (e.g., using `scale(1.02)` or heavy `cubic-bezier(0.175, 0.885, 0.32, 1.275)` for expanding elements).
    *   **Rule**: When adding modals, dropdowns, or drag states, ONLY use `opacity` fade-ins with very subtle `translateY` sliding (max `5px`-`10px`). Use linear `ease` curves. NEVER use `scale()` for entry transitions unless specifically asked.
2.  **Strict Material Design 3 Alignment**:
    *   Inputs, textareas, and URL fields MUST share the same consistent padding, background (`var(--surface-variant)`), and hover/focus states.
    *   Buttons (`.beautiful-btn`, `.btn-secondary`) MUST have identical padding (`12px 24px` or `0.75rem 1.5rem`) and exact structural alignment. Do not leave random inline margins that break flex gaps.
3.  **Defensive CSS Variable Fallbacks**:
    *   When mapping colors like `var(--primary)`, always consider that dynamic scripts might fail to inject them early. However, since the CSS root has static fallbacks, do not clutter JSX inline styles with color assignments. Keep it all in `index.css`.

## 3. Previously Solved Bugs & Quirks (DO NOT REGRESS)

> [!CAUTION]
> The following issues took significant time to debug. Do not overwrite these fixes!

*   **The `dnd-kit` CSS Transform Override Bug**:
    *   **Context**: In `AppGrid.jsx`, we use `dnd-kit` for sorting. When edit mode is OFF (`disabled: !isEditMode`), `useSortable` *still* returns a transform object like `{x: 0, y: 0, scaleX: 1, scaleY: 1}`.
    *   **Bug**: If you pass `CSS.Transform.toString(transform)` into the React `style` prop while `!isEditMode`, it compiles to `transform: translate3d(0,0,0)`. This inline style has higher specificity and completely OVERRIDES the normal `.card:hover` CSS animation (`transform: translateY(-8px)`).
    *   **Fix**: We conditionally render the `style` object. When `!isEditMode`, we completely omit `transform` and `transition` from the inline style. **Do NOT blindly destructure or re-attach dnd-kit's transform directly into normal DOM nodes without checking `isEditMode`.**
*   **Vite CSS `@keyframes` Caching (HMR Failure)**:
    *   **Bug**: When editing the inner properties of a CSS `@keyframes` block (e.g., stripping out `transform` from an existing `popIn` animation), the browser's GPU might aggressively cache the old animation even after Vite hot-reloads the CSS. The user will still see the old bouncy animation.
    *   **Fix**: If you change the behavior of an animation significantly to satisfy user feedback, **RENAME the animation entirely** (e.g., `dropdownIn` -> `dropdownFadeIn`) to force the browser to repaint and invalidate the cache.

## 4. Architecture & Data Structures
*   **Icon Mapping**: Because configurations are saved to `localStorage`/JSON, we cannot store React components directly. When adding new icons, you must register the string literal to the component reference inside `src/iconMap.js` or `src/socialIconMap.js`.
*   **Media Processing**: `App.jsx` handles local video/image blob loading via `localforage` to bypass the `localStorage` 5MB quota. Always use `localforage` for heavy data or when saving complex state arrays in the future.
*   **Responsive Modals**: Modals like `SocialModal` are split into columns. On screens `< 800px`, they must collapse into a single column (`flex-direction: column`). Ensure all new admin panels respect `.admin-panel-wrapper` width constraints and media queries.

End of instructions. Keep this document up to date when introducing new major libraries or encountering new bizarre framework quirks.
