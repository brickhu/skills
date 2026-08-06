export const languages = {
  zh: '中文',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  zh: {
    'site.title': "Fei ♥ Skills",
    'site.subtitle': '开源 AI 技能推广博客',
    'list.empty': '暂无文章',
    'read.more': '阅读全文 →',
    'back.list': '← 返回列表',
    'footer': '© Fei ♥ Skills · 开源技能，随便用、随便改、随便分享',
    'about.title': '什么是 Skills？',
    'about.body': 'Skills 是一组结构化的指令与参考文档，你的 AI 编程助手（Claude Code、Codex、Cursor、Zed 等）可以按需加载，立刻获得一项新能力——就像给 AI 装上插件。这里的每篇文章，都在介绍我原创并开源的技能：怎么装、怎么用、解决什么问题。',
    'label.original': '原创',
    'label.shared': '分享',
    'install.copied': '✓ 已复制',
  },
  en: {
    'site.title': "Fei ♥ Skills",
    'site.subtitle': 'Open-source AI skill promo blog',
    'list.empty': 'No articles yet',
    'read.more': 'Read more →',
    'back.list': '← Back to list',
    'footer': '© Fei ♥ Skills · open-source skills — use, modify, share freely',
    'about.title': 'What are Skills?',
    'about.body': 'Skills are structured instruction packs that your AI coding assistant (Claude Code, Codex, Cursor, Zed…) can load on demand to gain a new capability instantly — like plugins for your AI. Every article here introduces a skill I wrote and open-sourced: what it is, how to install it, and what problem it solves.',
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
