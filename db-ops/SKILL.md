---
name: db-ops
description: 通用数据库管理技能。当用户需要直接操作数据库时使用——查询/修改/删除数据、查看表结构、跑任意 SQL，或提到"查一下数据库""看看 xx 的记录""删掉某条数据""跑个 SQL""数据库里有没有"等表述。连接走白名单配置（项目目录优先，全局目录兜底），不自动嗅探环境；SELECT/INSERT 直接执行，UPDATE/DELETE/DROP 等写操作先展示计划等确认。
---

# db-ops：通用数据库增删改查（白名单配置 + 快捷指令）

不自动发现、不扫描环境变量/端口——**只连接配置里显式注册的连接**，并把项目常用多步操作封装为快捷指令（recipes）。

## 1. 配置结构（.dbops 目录）

**位置与优先级（整体覆盖，不合并）**：
- 全局：`~/.dbops/`（兜底）
- 项目：`<项目根>/.dbops/`（优先）
- **覆盖规则：项目目录存在 `.dbops/` 时，全局 `~/.dbops/` 在该项目下完全失效**——连接与 recipes 都只看项目配置，不合并

```
.dbops/
├── .env           # 连接串（gitignore + chmod 600）
├── recipes.json   # 快捷指令（零密钥，可进 git）
└── logs/          # 操作审计日志（gitignore）
```

**连接串（.env）**：一行一个连接，`<连接名>=<完整连接串>`——连接的"身份"就是连接串本身（地址+账户+密码）：
```bash
LOCAL=postgres://user:devpass@localhost:5432/dbname
REMOTE=postgres://user:pass@altaria.proxy.rlwy.net:50930/railway
```
推断规则（无需额外字段）：`TYPE` 从 scheme（`postgres://`→pg、`mysql://`→mysql、`sqlite:`→sqlite）；`ENV` 从 host（`localhost`→local、托管域名→remote，dev/prod 以语境为准）；描述 = 连接名。

**快捷指令（recipes.json）**：触发词 → 一段自然语言流程（模型自行拆解执行）。模板变量 `<参数>` 从用户指令提取，缺的问：
```json
{
  "recipes": [
    {
      "name": "添加邀请码",
      "triggers": ["添加邀请码", "生成邀请码"],
      "connection": "LOCAL",
      "prompt": "用 pnpm invites:create <code> 生成邀请码（工作目录 services/api），支持可选参数 [--expires <days>]；生成后用 SQL 查回确认已入库",
      "danger": false
    }
  ]
}
```
- `prompt`：完整自然语言指令——当作额外用户话术理解执行（模型判断是 shell / SQL / 组合），模板变量直接替换；**仍受本技能全部规则约束**：只在 `connection` 白名单连接上执行、翻译结果是危险操作时照常先确认
- `danger: true`：执行前强制走危险操作确认（即使 prompt 翻译出来只是 SELECT）
- recipes 由用户编辑维护；技能不代写（可提示如何加）

**连接选择（每条操作默认必确认）**：
- 用户指令已明确连接名（如"查 REMOTE 库的 xx"）→ 直接使用，不再询问
- 指令未明确 → **执行前必须询问**目标连接：列出白名单全部连接（名称 + host + 环境推断），等用户明确选择后再执行——即使只有一个连接也确认一次，杜绝"以为在连本地、实际连了远程"的错连
- 白名单外的连接一律拒绝，并提示如何加入配置（由用户手动编辑，技能不代写）

## 2. 执行规则

- 先看结构再查数据：PG `\dt` / MySQL `SHOW TABLES` / SQLite `.tables`；字段用 PG `\d <表>` / MySQL `DESCRIBE <表>`。表名含大写驼峰（如 `"user"`）时必须加双引号。
- **SELECT**：直接执行，结果回执为表格/列表。
- **INSERT**：直接执行（新增数据风险低），回执插入行。
- **UPDATE / DELETE / DROP / TRUNCATE / ALTER / 迁移**：危险操作——先展示计划块（操作 + 表 + WHERE + 预估行数，**先跑 `SELECT count(*)` 验证范围**），然后**要求用户输入动态确认串**（typed confirmation）：
  - 确认串格式：`confirm-<操作>-<连接名>-<预估行数>`，每次操作动态生成（如 `confirm-DELETE-LOCAL-4`）
  - 用户必须**逐字输入该确认串**才能执行；"是 / Y / 确认"等一律拒绝并重新提示
  - 确认串含连接名与行数——用户必须看过计划块才能答对，防误触、防模型代答
  - 确认后执行时 SQL 必须与计划块**完全一致**（不得中途修改），回执受影响行数
  - 远程库（host 非 localhost）的写操作默认危险，同样走确认串流程
- 多行 SQL 用 heredoc。

**审计日志（.dbops/logs/，每条操作必写）**：追加到 `logs/<日期>.log`（项目级；无项目配置时写 `~/.dbops/logs/`），一行一条：
```
[时间] [连接: 名 host env] [类型: SELECT|INSERT|UPDATE|DELETE|shell|recipe] [来源: 用户指令|recipe名] SQL/命令摘要 → 结果（影响行数/关键信息）
```
- 日志中**绝不记录连接串/密码**（host 可记）；SQL 原文可记（运营审计场景可接受），涉及密钥的语句值用 `***` 占位
- 危险操作（DELETE/UPDATE/DROP 等）与 recipe 执行必须落日志，含确认结果（`confirmed with confirm-...` / `declined`）

**工具链**：本机有 psql 直接用；没有则临时 docker 容器（用完即焚、连接串不落盘）：
```bash
# 注意：容器内 localhost 是容器自己——连宿主机库需替换为 host.docker.internal
docker run --rm -i postgres:16 psql "$(echo "$CONN" | sed 's/localhost/host.docker.internal/')" -c '<SQL>'
```

## 3. 安全

- 连接串、密码、密钥**永不打印**（展示为 `postgres://user:***@host`）；命令里不回显连接串（用变量引用）。
- `.env.dbops` 权限设为 `chmod 600`（仅本用户可读），并确保在项目 `.gitignore` 覆盖范围（`.env.*` 模式）。
- 输出脱敏：密码、token、密钥列用 `***`。
- **环境识别**：回执与确认前标注连接 env（local/dev/prod）。`prod` 与远程 `dev` 的写操作默认危险，需明确提醒并等显式确认。
- 删数据前永远先 count 确认范围；`WHERE` 缺失的 DELETE/UPDATE 一律视为误操作，需用户明确确认。

## 4. 回执格式

```
✓ 操作 + 结果（行数/关键字段）[连接: <名> <host> <env>]
✗ 失败 + 原因（错误信息含密钥则脱敏）[连接: <名> <host> <env>]
```
