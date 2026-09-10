type Recog = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function Ctor(): (new () => Recog) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function voiceAvailable() {
  return Ctor() !== null;
}

export function listenRu(onText: (t: string, final: boolean) => void): () => void {
  const Cls = Ctor();
  if (!Cls) return () => undefined;
  const rec = new Cls();
  rec.lang = "ru-RU";
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (ev) => {
    const last = ev.results[ev.results.length - 1];
    if (!last) return;
    onText(last[0].transcript, last.isFinal);
  };
  rec.onerror = () => undefined;
  rec.start();
  return () => rec.stop();
}
