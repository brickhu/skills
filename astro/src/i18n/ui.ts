export const languages = {
  zh: '中文',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  zh: {
    'site.title': "fei's skills",
    'site.subtitle': '开源 AI 技能推广博客',
    'list.empty': '暂无文章',
    'read.more': '阅读全文 →',
    'back.list': '← 返回列表',
    'footer': '© fei\'s skills · 开源技能，随便用、随便改、随便分享',
  },
  en: {
    'site.title': "fei's skills",
    'site.subtitle': 'Open-source AI skill promo blog',
    'list.empty': 'No articles yet',
    'read.more': 'Read more →',
    'back.list': '← Back to list',
    'footer': '© fei\'s skills · open-source skills — use, modify, share freely',
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
