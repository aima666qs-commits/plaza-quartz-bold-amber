#!/usr/bin/env python3
"""Female neural TTS: Svetlana (ru), Salma (ar-EG). Calm, older pacing."""
import asyncio
import sys

try:
    import edge_tts
except ImportError:
    sys.stderr.write("edge-tts missing\n")
    sys.exit(1)

VOICES = {
    "ar": "ar-EG-SalmaNeural",
    "ru": "ru-RU-SvetlanaNeural",
}


async def main() -> None:
    lang = (sys.argv[1] if len(sys.argv) > 1 else "ru").lower()[:2]
    text = sys.stdin.read().strip()[:800]
    if not text:
        sys.exit(2)
    voice = VOICES["ar"] if lang == "ar" else VOICES["ru"]
    comm = edge_tts.Communicate(text, voice, rate="-12%", pitch="-6Hz")
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            sys.stdout.buffer.write(chunk["data"])


if __name__ == "__main__":
    asyncio.run(main())
