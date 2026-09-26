export const uiZh = {
  'app.name': '羽球天赋',
  'app.tagline': '体型 × 能力 × 打法：找到最适合你的羽球风格',
  'nav.home': '首页',
  'nav.talent': '天赋测评',
  'nav.rating': '业余评级',
  'nav.mbti': '羽球MBTI',
  'nav.profile': '我的档案',
  'lang.switch': 'ES',
  'lang.switchLabel': '切换到西班牙语',
  'storage.unavailable': '当前浏览器无法保存数据（可能是无痕模式），测评结果不会被保存。',
  'common.backTop': '回到顶部',
} as const

export type UiKey = keyof typeof uiZh
