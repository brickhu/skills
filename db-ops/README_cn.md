# db-ops —— 通用数据库操作技能

> 让你的 AI 助手直接查库、改库，安全可控。

[English Guide / English README](./README.md)

`db-ops` 是一个 AI 技能包（标准的 `SKILL.md` 格式），让 AI 编程助手
（Claude Code、Cursor、Zed 以及任何支持 SKILL.md 的智能体）可以直接操作你的数据库：
查看表结构、跑查询、插数据，甚至执行高危写操作——内置严格的安全机制。

## 它能干什么

- **随便查**：`SELECT` 查询、表结构查看（PG `\dt` / MySQL `SHOW TABLES` / `\d <表>` / `DESCRIBE <表>`）
- **直接插**：`INSERT` 低风险，直接执行
- **危险操作带刹车**：`UPDATE / DELETE / DROP / TRUNCATE / ALTER / 迁移` 会先展示计划块
  （操作 + 表 + WHERE + 先跑 `SELECT count(*)` 估算行数），然后要求你**手动输入动态确认串**
  （如 `confirm-DELETE-LOCAL-4`）才会执行——回"是 / Y / 确认"都不行
- **快捷指令（recipes）**：把常用的多步操作（比如"生成邀请码"）封装成一句话触发，配置在 `recipes.json` 里
- **审计日志**：每次操作都会追加写入 `.dbops/logs/<日期>.log`，连接串和密码永不落日志
- **快捷指令对话管理**：直接跟 AI 说"加一个 recipe"，它起草给你确认后写入配置并校验 JSON
- **日志对话查询**：问一句"今天有哪些危险操作"，按连接/类型/来源过滤，对话里就能查
- **多种数据库**：PostgreSQL、MySQL、SQLite（根据连接串的 scheme 自动识别类型）
- **多语言自适应**：你说中文它就全程中文交流（提问、计划块、确认提示、回执、报错），说英文就英文——确认串格式固定为英文，不随语言变
- **社区 recipe 共享区**：浏览和提交社区 recipe：[Recipe Gallery](../recipes/README.md)

## 本地还是远程——只要能连上，就能管

db-ops **不限于本机数据库**。它连接的是任何你机器能访问到的数据库——只要你能写出它的连接串，技能就能操作它：

- **本地**：`localhost` 上的数据库（PostgreSQL / MySQL / SQLite）
- **远程**：局域网或 VPS 上的数据库（任意 IP / 域名），以及**云数据库**——AWS RDS、Railway、Neon、Supabase、PlanetScale、腾讯云 / 阿里云 RDS 等等，只要暴露了连接串就行

技能会根据 host 推断环境：`localhost` → 本地，托管域名 → 远程（dev/prod）。**远程库的写操作默认按危险处理**，一律走"计划 + 确认串"流程。

唯一的例外是 SQLite——它是本地文件，天生只能在本机用。

## 为什么安全

- **不自动探测**：不扫描环境变量、不扫端口——只连配置里显式注册的连接（白名单）
- **连接必确认**：每条操作都会确认目标连接（哪怕只有一个连接也确认一次），杜绝"以为连了本地、实际连了远程"
- **动态确认串**：危险操作需要你输入包含连接名和预估行数的确认串，必须真看过计划块才答得对，防误触、防模型代答
- **密钥永不泄露**：连接串展示为 `postgres://user:***@host`，输出自动脱敏，`.env` 文件 `chmod 600` 且被 gitignore
- **环境标注**：每条回执都标注连接环境（local / dev / prod）；远程库和 prod 的写操作默认按危险处理

## 审计日志

每一次操作——SELECT 查询、INSERT 插入、危险写操作、shell 命令、recipe 执行——都会追加写入**日志文件** `.dbops/logs/<日期>.log`（项目级；没有项目配置时写到全局 `~/.dbops/logs/`）。每条记录长这样：

```
[2026-08-04 16:30:12] [连接: LOCAL localhost 本地] [类型: DELETE] [来源: 用户指令] DELETE FROM orders WHERE id = 5 → 1 行受影响（已确认 confirm-DELETE-LOCAL-1）
```

- **谁**：连接（名 / host / 环境）、操作类型、来源（用户指令或 recipe）
- **干了什么**：SQL / 命令摘要，以及结果（影响行数 / 关键信息）
- **危险操作必落日志**，包括确认结果（`confirmed with confirm-...` / `declined`）
- **绝不记录**：连接串、密码、密钥值——凡涉及密钥的内容一律用 `***` 打码

这就是运营后台一直缺的"操作历史"：万一数据出了意外，可以精确追溯到什么时候、在哪个库上、执行了什么操作。

## 环境要求

- 本机有 `psql` / `mysql` 客户端；或者有 **Docker**（技能会临时起一个 `postgres:16` 容器，用完即焚，连接串不落盘）

## 安装方法

```sh
# 方式一：通过 skills.sh 命令行安装（-s 指定只安装 db-ops 这一个技能）
npx skills add brickhu/skills -s db-ops

# 方式二：手动安装（适用于任何支持 SKILL.md 的智能体）
mkdir -p ~/.claude/skills
cp -r db-ops ~/.claude/skills/db-ops
```

装好后重启一次会话，AI 就会自动发现这个技能。

## 快速上手

1. **登记连接**：在项目里建 `.dbops/` 目录（或在全局 `~/.dbops/`），在 `.env` 里一行一个连接：

   ```bash
   # .dbops/.env  （chmod 600，记得 gitignore）
   # localhost、VPS、任意云数据库——什么 host 都行
   LOCAL=postgres://user:devpass@localhost:5432/dbname
   REMOTE=postgres://user:pass@altaria.proxy.rlwy.net:50930/railway
   ```

2. **（可选）配置快捷指令**：把 `recipes.example.json` 复制成 `recipes.json`，加你的常用流程：

   ```json
   {
     "recipes": [
       {
         "name": "添加邀请码",
         "triggers": ["添加邀请码", "生成邀请码"],
         "connection": "LOCAL",
         "prompt": "用 pnpm invites:create <code> 生成邀请码（工作目录 services/api），生成后用 SQL 查回确认已入库",
         "danger": false
       }
     ]
   }
   ```

3. **直接跟 AI 说**，比如：

   - "帮我查一下 REMOTE 库的 users 表结构"
   - "看看 LOCAL 库最近 10 条订单记录"
   - "把 id=5 的订单状态改成 shipped，先给我看计划"（危险操作，需要你输入确认串）
   - "添加邀请码 abc123"（触发快捷指令）

## 目录结构

```
db-ops/
├── SKILL.md             # 技能定义（名称、描述、执行规则）
├── env.example          # 连接串示例文件
├── recipes.example.json # 快捷指令示例
├── README.md            # English README
└── README_cn.md         # 本文件（中文指南）
```

## 社区 recipes 与分享

浏览和导入现成 recipe：[Recipe 共享区](../recipes/README.md)。

**提交你自己的 recipe** —— 打开 [recipe issue 表单](https://github.com/brickhu/skills/issues/new?template=recipe.yml)，按固定模板填写（名称、说明、数据库、危险度，以及用 ```json 代码块包裹的 recipe JSON），提交 issue。维护者打上 `approved` 标签后，recipe 会被自动校验并收录进共享区。

## License

MIT —— 随便用，随便改，随便分享。
