export type MushafLayout = "page" | "ayah" | "words";

export const MUSHAF_LAYOUTS: { id: MushafLayout; ru: string; hint: string }[] = [
  { id: "page", ru: "Страница", hint: "Как мусхаф: аяты текут, номер в конце" },
  { id: "ayah", ru: "Аят", hint: "Каждый аят отдельной карточкой, письмо цельное" },
  { id: "words", ru: "Слова", hint: "Каждое слово отдельно — для обучения" },
];
