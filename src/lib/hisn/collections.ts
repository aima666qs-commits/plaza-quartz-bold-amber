export type HisnCollection = {
  id: string;
  labelKey: string;
  chapterIds: number[];
};

export const HISN_COLLECTIONS: HisnCollection[] = [
  { id: "morning", labelKey: "hisn.col.morning", chapterIds: [27] },
  { id: "prayer", labelKey: "hisn.col.prayer", chapterIds: [25] },
  { id: "sleep", labelKey: "hisn.col.sleep", chapterIds: [28] },
  { id: "wake", labelKey: "hisn.col.wake", chapterIds: [1] },
  { id: "home", labelKey: "hisn.col.home", chapterIds: [10, 11] },
  { id: "mosque", labelKey: "hisn.col.mosque", chapterIds: [12, 13, 14, 15] },
  { id: "food", labelKey: "hisn.col.food", chapterIds: [69, 70] },
  { id: "travel", labelKey: "hisn.col.travel", chapterIds: [95, 96] },
  { id: "dhikr", labelKey: "hisn.col.dhikr", chapterIds: [130, 131] },
  { id: "tawba", labelKey: "hisn.col.tawba", chapterIds: [129] },
];
