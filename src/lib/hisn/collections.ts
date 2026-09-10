/** UI-ярлыки для навигации. Это не русское издание книги — заголовки глав: арабский и английский с hisnmuslim.com. */
export type HisnCollection = {
  id: string;
  label: string;
  chapterIds: number[];
};

export const HISN_COLLECTIONS: HisnCollection[] = [
  { id: "morning", label: "Утро и вечер", chapterIds: [27] },
  { id: "prayer", label: "После намаза", chapterIds: [25] },
  { id: "sleep", label: "Перед сном", chapterIds: [28] },
  { id: "wake", label: "Пробуждение", chapterIds: [1] },
  { id: "home", label: "Дом", chapterIds: [10, 11] },
  { id: "mosque", label: "Мечеть", chapterIds: [12, 13, 14, 15] },
  { id: "food", label: "Еда", chapterIds: [69, 70] },
  { id: "travel", label: "В пути", chapterIds: [95, 96] },
  { id: "dhikr", label: "Зикр", chapterIds: [130, 131] },
  { id: "tawba", label: "Тауба", chapterIds: [129] },
];
