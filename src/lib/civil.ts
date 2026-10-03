const SWEAR =
  /\b(?:бля(?:ть|дь)?|хуй\w*|пизд\w*|еб(?:а|у|л|ё)\w*|ёб\w*|сука|мудак\w*|нахуй|fuck\w*|shit\w*)\b/giu;

/** Описание приложения и подписи не держат брань. Смысл фразы остаётся. */
export function civil(text: string): string {
  return text.replace(SWEAR, "").replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
}
