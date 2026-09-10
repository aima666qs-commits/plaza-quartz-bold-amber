export type HisnDua = {
  id: number;
  ar: string;
  en: string;
  repeat: number;
  audio: string;
};

export type HisnChapter = {
  id: number;
  titleAr: string;
  titleEn: string;
  audio: string;
  duas: HisnDua[];
};

export type HisnBook = {
  titleAr: string;
  titleRu: string;
  author: string;
  authorAr: string;
  source: {
    publisher: string;
    indexAr: string;
    indexEn: string;
    retrievedAt: string;
    note: string;
  };
  chapters: HisnChapter[];
};
