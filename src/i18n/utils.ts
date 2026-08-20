import { ui, defaultLang, type Lang, type UIKey } from "./ui";

/**
 * 从当前 URL 推断语言。
 *   /        -> "zh"  (默认)
 *   /en/...  -> "en"
 */
export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split("/");
  if (maybeLang === "en") return "en";
  return defaultLang;
}

/**
 * 取一个翻译函数,绑定到指定语言。
 *
 *   const t = useTranslations("zh");
 *   t("nav.home")  // -> "首页"
 *
 * 找不到 key 时回退到默认语言;再找不到就返回 key 本身,方便定位漏翻译。
 */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key] ?? key;
  };
}

/**
 * 把一条 zh 路径(如 "/about")翻译成对应语言的路径。
 *   localizedPath("/about", "en")  -> "/en/about"
 *   localizedPath("/about", "zh")  -> "/about"
 *   localizedPath("/", "en")       -> "/en/"
 *
 * 也支持反向(传入 en 路径取 zh 路径)。
 */
export function localizedPath(path: string, targetLang: Lang): string {
  // 标准化:去掉前缀 /en
  let normalized = path;
  if (normalized.startsWith("/en/")) {
    normalized = normalized.slice(3); // "/en/about" -> "/about"
  } else if (normalized === "/en") {
    normalized = "/";
  }
  if (targetLang === defaultLang) return normalized;
  // 加 /en 前缀
  if (normalized === "/") return "/en/";
  return "/en" + normalized;
}

/**
 * 把当前 URL 切换到另一种语言的对应路径。
 * 用于 navbar 里的语言切换按钮。
 */
export function switchLangPath(url: URL, targetLang: Lang): string {
  return localizedPath(url.pathname, targetLang);
}
