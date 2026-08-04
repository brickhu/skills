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
- **多种数据库**：PostgreSQL、MySQL、SQLite（根据连接串的 scheme 自动识别类型）

## 为什么安全

- **不自动探测**：不扫描环境变量、不扫端口——只连配置里显式注册的连接（白名单）
- **连接必确认**：每条操作都会确认目标连接（哪怕只有一个连接也确认一次），杜绝"以为连了本地、实际连了远程"
- **动态确认串**：危险操作需要你输入包含连接名和预估行数的确认串，必须真看过计划块才答得对，防误触、防模型代答
- **密钥永不泄露**：连接串展示为 `postgres://user:***@host`，输出自动脱敏，`.env` 文件 `chmod 600` 且被 gitignore
- **环境标注**：每条回执都标注连接环境（local / dev / prod）；远程库和 prod 的写操作默认按危险处理

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

## License

MIT —— 随便用，随便改，随便分享。
