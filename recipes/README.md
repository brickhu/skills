# db-ops Recipe Gallery · Recipe 共享区

Community-shared quick recipes for [db-ops](../db-ops/). 社区共享的 db-ops 快捷指令，共 5 个。

## Submit a recipe · 提交 recipe

Open an issue via the [recipe form](https://github.com/brickhu/skills/issues/new?template=recipe.yml) and fill in the template. Once a maintainer adds the `approved` label, the recipe is validated and added to this gallery automatically.

通过 [recipe 表单](https://github.com/brickhu/skills/issues/new?template=recipe.yml) 提交 issue；维护者审阅后打上 `approved` 标签，recipe 会被自动校验并收录到本页。

## Import into db-ops · 导入使用

Copy a JSON file below, paste it into your agent chat, and say "add this recipe" — bind the connection when asked. Or merge it into your `.dbops/recipes.json` manually.

复制下方任意 JSON 文件内容，粘贴到对话里说"添加这个 recipe"，按提示绑定连接即可；也可以手动并入 `.dbops/recipes.json`。

| Recipe | Description | Danger | Databases | Author |
|---|---|---|---|---|
| [cleanup-test-data](./cleanup-test-data.json) | Count and delete test users whose email ends with @test.local | high | postgres / mysql / sqlite | brickhu |
| [invite-code](./invite-code.json) | Generate an invite code, insert it, and verify it landed in the database | low | postgres / mysql | brickhu |
| [lookup-user](./lookup-user.json) | Look up a user by email: id, email, verification status, created_at | low | postgres / mysql / sqlite | brickhu |
| [user-audit-trigger](./user-audit-trigger.json) | Create an audit trigger: after a user INSERT, log it into the activities table automatically | high | postgres / mysql | brickhu |
| [weekly-stats-report](./weekly-stats-report.json) | Count this week's new users grouped by channel, sorted descending | low | postgres / mysql | brickhu |

---
_Table auto-generated — do not edit by hand. 表格由 GitHub Action 自动生成，请勿手改。_
