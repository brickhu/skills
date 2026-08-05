# recomp

把组件库文档复刻成**适配你框架的 headless 组件**——纯行为、零样式，所有产出直接展示在对话里，复制即用。

> English version: [README.md](./README.md)

## 它能做什么

你发一个组件库文档 URL（shadcn/ui、Radix、MUI、Ant Design 等），recomp 会：

1. **验证页面**确实是组件库文档页——博客、工具库、设计稿一律拒绝，并给出原因
2. **只读探测你的工程**——框架+版本、CSS 方案、设计 token（DESIGN.md、`:root` CSS 变量、`@theme`、stylex tokens）——不建目录、不改文件
3. **产出**：
   - **行为契约摘要**——哪些来自文档、哪些按 WAI-ARIA APG 补全、哪些留给你拍板
   - **headless 组件源码**（SolidJS / Vue / Svelte），完整文件 + 依赖清单
   - **使用说明**（示例 + API 摘要）
   - **样式接口契约**——data-attribute、class 插槽、CSS 变量，按你的 CSS 方案定制（Tailwind 走 className 透传、StyleX 走 style props）

样式和设计 token 完全由你掌控：把源码复制进你的组件目录，接上样式即可。
不满意某处行为？直接说，我重出整个文件。

## 安装

一行命令（[skills CLI](https://skills.sh)）：

```sh
npx skills add brickhu/skills/recomp
```

纯提示词驱动：无依赖、无构建步骤。（手动方式：把 `recomp/` 文件夹复制到 agent 技能目录，如 `~/.agents/skills/`。）

## 使用

1. 发送组件库文档 URL：`recomp <url>`
2. （可选）指定项目根目录以便探测：`recomp <url> --project ~/my-app`——不指定则回退到当前工作目录
3. 审阅行为契约摘要，复制源码
4. 对话迭代：*"escape 处理不对"*、*"这里用 `bind:` 不要用 `v-model`"*——每次修订都输出完整文件

## 它会拒绝什么

- **非组件库页面**（博客、工具库、设计稿）——拒绝并说明原因
- **猜测无障碍语义**（ARIA / 焦点 / 键盘行为）——按 WAI-ARIA APG 补全，或明确标注"未实现"
- **写入你的工程**——探测只读，产出全在对话里
- **让你去装第三方库**——你生态里已有等价实现（Solid 的 Kobalte、Vue 的 Reka UI、Svelte 的 Bits UI）时，它只把它们当参考来学习，**依然交付你自己可复制的代码和使用指南**——组件库始终握在你手里

## 文件结构

```
recomp/
├── SKILL.md                     # 技能定义（入口）
├── README.md                    # English guide
├── README_cn.md                 # 本指南
└── references/
    ├── verification.md          # URL 验证清单与拒绝情形
    ├── probing.md               # 只读工程探测的信号与置信度
    └── deliverables.md          # 交付物模板与决策分类
```

## License

MIT
