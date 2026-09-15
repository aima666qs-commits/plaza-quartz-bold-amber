#!/usr/bin/env python3
"""Neural TTS. Voice id, gender and rate come from the app settings."""
import asyncio
import re
import sys

try:
    import edge_tts
except ImportError:
    sys.stderr.write("edge-tts missing\n")
    sys.exit(1)

MALE = {
    "ar": "ar-SA-HamedNeural",
    "ru": "ru-RU-DmitryNeural",
    "en": "en-US-GuyNeural",
    "tr": "tr-TR-AhmetNeural",
}
FEMALE = {
    "ar": "ar-SA-ZariyahNeural",
    "ru": "ru-RU-SvetlanaNeural",
    "en": "en-US-JennyNeural",
    "tr": "tr-TR-EmelNeural",
}
RATES = {"slow": "-8%", "normal": "+14%", "fast": "+32%"}
VOICE_ID = re.compile(r"^[a-zA-Z]{2}-[a-zA-Z]{2}-[A-Za-z]+Neural$")


async def main() -> None:
    lang = (sys.argv[1] if len(sys.argv) > 1 else "ru").lower()[:2]
    gender = (sys.argv[2] if len(sys.argv) > 2 else "male").lower()
    rate_key = (sys.argv[3] if len(sys.argv) > 3 else "normal").lower()
    raw_voice = sys.argv[4] if len(sys.argv) > 4 else ""
    text = sys.stdin.read().strip()[:800]
    if not text:
        sys.exit(2)
    table = FEMALE if gender == "female" else MALE
    voice = raw_voice if VOICE_ID.fullmatch(raw_voice) else table.get(lang, table["ru"])
    rate = RATES.get(rate_key, RATES["normal"])
    pitch = "-2Hz" if gender == "female" else "+2Hz"
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            sys.stdout.buffer.write(chunk["data"])


if __name__ == "__main__":
    asyncio.run(main())
