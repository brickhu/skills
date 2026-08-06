export const languages = {
  zh: '中文',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  zh: {
    'site.title': 'FEI <3 SKILLS',
    'site.subtitle': '我是飞，一名专注于 AI 和 Web3 领域的独立开发者。我每天用 AI 完成各种工作，喜欢把工作中可以<b>复用</b>的经验和流程整理成 Skill，也乐意和你分享我发现的实用 Skills。如果你创造了好用的 Skills，也欢迎<a href="https://github.com/brickhu/skills/issues" target="_blank" rel="noopener" class="underline">向我投稿</a>！',
    'list.empty': '暂无文章',
    'read.more': '阅读全文 →',
    'back.list': '← 返回列表',
    'footer': '© Fei 2026',
    'about.title': '什么是 Skills？',
    'about.body': 'Skills 是一组结构化的指令与参考文档，你的 AI 编程助手（Claude Code、Codex、Cursor、Zed 等）可以按需加载，立刻获得一项新能力——就像给 AI 装上插件。<a href="https://www.skills.sh/docs" target="_blank" rel="noopener" class="underline">点击这里</a>了解如何安装和使用。',
    'label.original': '原创',
    'label.shared': '分享',
    'install.copied': '✓ 已复制',
  },
  en: {
    'site.title': 'FEI <3 SKILLS',
    'site.subtitle': "I'm Fei, an indie developer focused on AI and Web3. I use AI for nearly everything in my daily work, and I love turning reusable experience and workflows into Skills — and sharing the useful ones I find. If you've built a great Skill, feel free to <a href=\"https://github.com/brickhu/skills/issues\" target=\"_blank\" rel=\"noopener\" class=\"underline\">submit it</a>!",
    'list.empty': 'No articles yet',
    'read.more': 'Read more →',
    'back.list': '← Back to list',
    'footer': '© Fei 2026',
    'about.title': 'What are Skills?',
    'about.body': 'Skills are structured instruction packs that your AI coding assistant (Claude Code, Codex, Cursor, Zed…) can load on demand to gain a new capability instantly — like plugins for your AI. <a href="https://www.skills.sh/docs" target="_blank" rel="noopener" class="underline">Click here</a> to learn how to install and use them.',
    'label.original': 'Original',
    'label.shared': 'Shared',
    'install.copied': '✓ Copied',
  },
} as const;

export type UiKey = keyof (typeof ui)['zh'];

export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key];
}

export function formatDate(date: Date, lang: Lang): string {
  if (lang === 'zh') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
