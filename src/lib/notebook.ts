const KEY = "mizan.notebook";

export type NoteKind = "ayah" | "hadith" | "lesson" | "note";

export type StudyNote = {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
  at: number;
};

export function readNotes(): StudyNote[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as StudyNote[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function writeNotes(list: StudyNote[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

export function addNote(note: Omit<StudyNote, "id" | "at">) {
  const next: StudyNote = { ...note, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now() };
  writeNotes([next, ...readNotes()]);
  return next;
}

export function removeNote(id: string) {
  writeNotes(readNotes().filter((n) => n.id !== id));
}
