# 好组件库是"菜谱"，不该被 React 的厨房锁死——recomp，把组件文档翻译成你的框架

> 开源技能 recomp 推广｜仓库：https://github.com/brickhu/skills

---

## 现在的设计组件库，为什么你都用不上？

不是它们不好——shadcn/ui、Radix、MUI、Ant Design，一个比一个精致。问题出在"用得上"这三个字上。

深夜 23:47，你正在为自己的 App 打磨一个日期选择组件。你发现了 shadcn/ui 的 DatePicker，很惊艳，交互模式也基本符合你的要求。你花了大把时间研究它的安装使用流程，把使用文档翻了个遍——然而一个根本问题始终绕不过去：**框架不对**。它只支持 React，而你的项目用的是 SolidJS。

其实，我们选用第三方设计组件库时，普遍都会面临这么几个问题：

- **框架对不上**：JSX、hooks、受控组件，复制过来直接报错——最精致的组件库几乎全是 React 写的，而你用的是 SolidJS / Vue / Svelte
- **样式对不上**：组件库用 Tailwind 写的，你的项目用的是 StyleX / CSS-in-JS，class 满天飞，接不进来
- **设计对不上**：组件库自带一套 design token，跟你的设计系统打架，改起来比重写还累

这些问题落到编辑器里，症状大概长这样：

```text
✗ SyntaxError: JSX expressions must have one parent element   ← 框架不对
✗ [plugin:vite:vue] Unexpected token '<'                       ← 还是框架不对
✗ Unknown utility class: group-hover/…                         ← 样式方案也不对
```

于是你合上页面，安慰自己"回头自己写一个"——然后就没有然后了。**看中 → 复制 → 报错 → 放弃 → 手搓轮子**，这就是很多非 React 前端开发者的循环。

## 组件库是"成品菜"，你要的其实是"菜谱"

组件库就是一盘**做好的成品菜**——React 实现、样式、设计 token，整整齐齐端到你面前，复制过来就能"吃"。

但前提是：**你家灶台（框架）和口味（样式方案）恰好和这家餐厅一样。** 你的灶台是 Vue / Solid / Svelte，口味是 StyleX / 你的 design token——所以这盘菜再好，你也吃不了。

你真正需要的，不是这盘菜，而是它的**菜谱**：

- 下拉框：方向键怎么选、回车怎么确定、Escape 怎么关
- 弹窗：焦点怎么锁、关掉之后焦点还去哪儿、滚动怎么锁
- 无障碍：读屏软件听到什么、ARIA 角色挂在哪个节点上

**这些行为逻辑跟框架无关。** 它只是恰好被用 React 语法写了一遍而已——就像川菜菜谱用中文写，不代表只有会中文的人才能做川菜。

而"摆盘"——颜色、间距、圆角、阴影——本来就该由你自己的设计系统说了算。别人的摆盘，永远是你的参考，不该是你的全部。

| 菜谱（行为契约） | 灶台（你的框架） | 摆盘（你的样式） |
|---|---|---|
| 状态、键盘、焦点、ARIA | Svelte 5 的 runes / Vue 的 v-model / Solid 的 signal | 设计 token、StyleX、Tailwind |

菜谱不该被厨房锁死。你要做的，只是把菜谱**翻译**成你家灶台的用法。

## recomp——通过成品菜，生成适合你的菜谱

`recomp` 是开源的 AI 技能包，装上之后，你的 AI 编程助手就变成你的**组件复刻外包**：发一个组件库文档 URL，它交付四样东西：

1. **行为契约摘要**——接口、行为、每一步做法的出处（来自文档 / 按规范补全 / 留给你拍板），你先审再动手
2. **headless 组件源码**——纯行为、零样式，按你的框架惯用法写：Vue 用 `v-model`、Svelte 5 用 `bind:`/runes、Solid 用 signal，不是把 JSX 改个名就交差
3. **使用说明 + 依赖清单**——复制就能用
4. **样式接口契约**——data-attribute 全集、class 插槽、CSS 变量，接你的设计 token 用

**样式和设计 token 完全归你。** 它交付的是行为层，怎么"摆盘"是你的设计系统说了算。

## 你可能会担心：AI 复刻的东西，能信吗？

放心，最容易被做砸的几个环节，它都提前上了保险：

- **不是组件库页面？拒绝。** 你发的是博客、工具库、设计稿，它直接拒绝并说明原因，绝不硬着头皮"猜着复刻"
- **无障碍语义绝不瞎猜。** ARIA 角色、焦点管理、键盘行为，要么按 WAI-ARIA APG 规范补全（并逐条标注出处），要么明确告诉你"这块没实现"——宁可留白，不做假
- **不碰你的工程。** 探测你的框架、CSS 方案、设计 token 时只读：不建目录、不改文件，探测结果只用在当前这一个组件上
- **许可边界分明。** 复刻的是"接口 + 行为"，不抄别人的源码和样式值，来源记录留档，商用也安心

一句话：**AI 负责复刻，接口、行为、边界全都在你手里。**

## 安装与使用：一个完整例子

**安装（一行命令）：**

```sh
# 路径里的 /recomp 就是技能名，无需再加 -s
npx skills add brickhu/skills/recomp
```

**以"给 Svelte 5 项目复刻 shadcn/ui 的 Dialog"为例，完整流程是这样：**

你发：

> 复刻 https://ui.shadcn.com/docs/components/dialog，项目在 ~/my-app（Svelte 5）

它先回你一份**行为契约摘要**：

```text
✅ 验证通过：shadcn/ui 的 Dialog 文档页
接口：open / onOpenChange → Svelte 5 写法 bind:open
行为：Escape 关闭 · 点击遮罩关闭 · 焦点锁在弹窗内 · 关闭后焦点还原 · 滚动锁定 · aria-modal
决策：12 条来自文档 · 3 条按 WAI-ARIA APG 补全 · 0 条留空
依赖：零依赖，纯原生实现
```

你确认没问题，它按文件输出**完整源码**（节选）：

```svelte
<!-- src/Dialog.svelte（节选） -->
<script lang="ts">
  let { open = $bindable(false) }: Props = $props();
  // Escape 关闭、焦点陷阱、滚动锁定、ARIA……行为全在这里
</script>
```

以及**使用示范**：

```svelte
<script>
  import Dialog from "$lib/components/Dialog.svelte";
  let open = $state(false);
</script>

<Dialog bind:open>
  <button slot="trigger">打开对话框</button>
  <h2 slot="title">确认删除？</h2>
  <button slot="footer" onclick={() => (open = false)}>取消</button>
</Dialog>
```

复制源码、接上你的样式，完事。不满意某处行为？直接在对话里说——"Escape 处理不对""这里用 bind 不要用 v-model"——它当场重出完整文件，不用打补丁。

## 最后

组件库是"成品菜"，你的项目需要的是"菜谱"——行为逻辑。

**与其被框架和样式方案锁死，不如让 AI 帮你把行为层复刻出来，样式交给你的设计系统。**

recomp 开源免费（MIT），支持任何能加载 SKILL.md 的 AI 助手（Claude Code、Cursor、Zed 都行），随便用、随便改、随便分享。

📦 仓库地址：**https://github.com/brickhu/skills**
📖 中英文使用指南都在仓库里（README_cn.md / README.md）

欢迎 Star，欢迎提 issue，欢迎把你复刻的好组件分享出来。

**你的灶台，该有自己的菜谱了。**
