// Rebuilds recipes/README.md (the gallery page) from recipes/*.json,
// and emits docs/data/recipes.json for the GitHub Pages site.
// Run from the repo root: node .github/scripts/build-gallery.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const recipesDir = join(root, 'recipes');
const files = readdirSync(recipesDir).filter((f) => f.endsWith('.json')).sort();

const recipes = files.map((f) => {
  const data = JSON.parse(readFileSync(join(recipesDir, f), 'utf8'));
  return { ...data, file: f };
});

// Site data: docs/data/recipes.json (served by GitHub Pages from /docs)
const siteDir = join(root, 'docs/data');
mkdirSync(siteDir, { recursive: true });
writeFileSync(join(siteDir, 'recipes.json'), JSON.stringify(recipes, null, 2) + '\n');
console.log(`Site data updated: docs/data/recipes.json (${recipes.length} recipe(s))`);

const rows = files.map((f) => {
  const data = JSON.parse(readFileSync(join(recipesDir, f), 'utf8'));
  const meta = data._meta || {};
  const danger = data.danger ? 'high' : 'low';
  const dbs = (Array.isArray(meta.databases) ? meta.databases : []).join(' / ') || 'any';
  const author = meta.author || 'community';
  const desc = String(data.description || '-').replaceAll('|', '\\|').replaceAll('\n', ' ');
  return `| [${data.name}](./${f}) | ${desc} | ${danger} | ${dbs} | ${author} |`;
}).join('\n');

const readme = `# db-ops Recipe Gallery · Recipe 共享区

Community-shared quick recipes for [db-ops](../db-ops/). 社区共享的 db-ops 快捷指令，共 ${files.length} 个。

## Submit a recipe · 提交 recipe

Open an issue via the [recipe form](https://github.com/brickhu/skills/issues/new?template=recipe.yml) and fill in the template. Once a maintainer adds the \`approved\` label, the recipe is validated and added to this gallery automatically.

通过 [recipe 表单](https://github.com/brickhu/skills/issues/new?template=recipe.yml) 提交 issue；维护者审阅后打上 \`approved\` 标签，recipe 会被自动校验并收录到本页。

## Import into db-ops · 导入使用

Copy a JSON file below, paste it into your agent chat, and say "add this recipe" — bind the connection when asked. Or merge it into your \`.dbops/recipes.json\` manually.

复制下方任意 JSON 文件内容，粘贴到对话里说"添加这个 recipe"，按提示绑定连接即可；也可以手动并入 \`.dbops/recipes.json\`。

| Recipe | Description | Danger | Databases | Author |
|---|---|---|---|---|
${rows}

---
_Table auto-generated — do not edit by hand. 表格由 GitHub Action 自动生成，请勿手改。_
`;

writeFileSync(join(recipesDir, 'README.md'), readme);
console.log(`Gallery updated: ${files.length} recipe(s) -> recipes/README.md`);
