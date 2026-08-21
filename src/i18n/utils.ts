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

function getBasePath(): string {
  const base = import.meta.env.BASE_URL ?? "/";
  if (base === "/") return "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function stripBase(path: string): string {
  const base = getBasePath();
  if (!base) return path;
  if (path === base) return "/";
  if (path.startsWith(base + "/")) return path.slice(base.length);
  return path;
}

/**
 * 给站内路径补上 Astro base 前缀。
 * 本地开发时通常是 "/"，GitHub Pages 下会是仓库子路径。
 */
export function withBase(path: string): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("#")
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = stripBase(path);

  if (cleanPath === "/") return base;
  if (cleanPath.startsWith("/")) return `${normalizedBase}${cleanPath}`;
  return `${normalizedBase}/${cleanPath}`;
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
  const base = getBasePath();
  let working = stripBase(path);

  // 标准化:去掉前缀 /en
  if (working.startsWith("/en/")) {
    working = working.slice(3); // "/en/about" -> "/about"
  } else if (working === "/en") {
    working = "/";
  }
  if (targetLang === defaultLang) return base + working;
  // 加 /en 前缀
  if (working === "/") return base + "/en/";
  return base + "/en" + working;
}

/**
 * 把当前 URL 切换到另一种语言的对应路径。
 * 用于 navbar 里的语言切换按钮。
 */
export function switchLangPath(url: URL, targetLang: Lang): string {
  return localizedPath(url.pathname, targetLang);
}
