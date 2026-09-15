#!/usr/bin/env python3
"""Build a signed Android APK wrapping Mizan in a WebView with bundled assets."""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
from urllib.request import urlopen

ROOT = Path("/workspace")
ANDROID = ROOT / "android"
TOOLS = Path("/tmp/android-build")
WORK = TOOLS / "project"
SRC_JAVA = ANDROID / "src/app/mizanx/mizan/MainActivity.java"
STATIC = ROOT / ".vercel/output/static"
PUBLIC = ROOT / "public"
OUT_APK = PUBLIC / "mizan.apk"
KS = ANDROID / "mizan.keystore"
KS_PASS = "mizanxpro"
KS_ALIAS = "mizan"

APKTOOL = TOOLS / "apktool.jar"
R8 = TOOLS / "r8.jar"
ANDROID_JAR = TOOLS / "android.jar"
SIGNER = TOOLS / "uber-apk-signer.jar"


def run(cmd: list[str] | str, **kw):
    print("+", cmd if isinstance(cmd, str) else " ".join(cmd), flush=True)
    subprocess.check_call(cmd, **kw)


def ensure_keystore():
    if KS.exists():
        return
    run(
        [
            "keytool",
            "-genkeypair",
            "-keystore",
            str(KS),
            "-alias",
            KS_ALIAS,
            "-keyalg",
            "RSA",
            "-keysize",
            "2048",
            "-validity",
            "10000",
            "-storepass",
            KS_PASS,
            "-keypass",
            KS_PASS,
            "-dname",
            "CN=Mizan, OU=Mizan, O=Mizan, L=Cairo, ST=Cairo, C=EG",
        ]
    )


def make_icons():
    from PIL import Image, ImageOps

    src = PUBLIC / "brand/mizan-mark.jpg"
    im = Image.open(src).convert("RGBA")
    bg = (4, 16, 12, 255)
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 230 and g > 230 and b > 230:
                px[x, y] = (0, 0, 0, 0)
            elif r < 18 and g < 28 and b < 22:
                px[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox() or (0, 0, w, h)
    im = im.crop(bbox)
    sizes = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192,
    }
    for density, size in sizes.items():
        canvas = Image.new("RGBA", (size, size), bg)
        pad = max(2, size // 8)
        inner = size - pad * 2
        fitted = ImageOps.contain(im, (inner, inner))
        ox = (size - fitted.size[0]) // 2
        oy = (size - fitted.size[1]) // 2
        canvas.paste(fitted, (ox, oy), fitted)
        dest = WORK / f"res/mipmap-{density}"
        dest.mkdir(parents=True, exist_ok=True)
        canvas.save(dest / "ic_launcher.png", "PNG")


def compile_dex():
    classes = TOOLS / "classes"
    if classes.exists():
        shutil.rmtree(classes)
    classes.mkdir(parents=True)
    run(
        [
            "javac",
            "--release",
            "8",
            "-cp",
            str(ANDROID_JAR),
            "-d",
            str(classes),
            str(SRC_JAVA),
        ]
    )
    dex_dir = TOOLS / "dex"
    if dex_dir.exists():
        shutil.rmtree(dex_dir)
    dex_dir.mkdir()
    class_files = [str(p) for p in classes.rglob("*.class")]
    run(
        [
            "java",
            "-cp",
            str(R8),
            "com.android.tools.r8.D8",
            "--lib",
            str(ANDROID_JAR),
            "--min-api",
            "21",
            "--output",
            str(dex_dir),
            *class_files,
        ]
    )
    dex = dex_dir / "classes.dex"
    if not dex.exists():
        raise SystemExit("d8 did not emit classes.dex")
    return dex


def write_apktool_yml():
    (WORK / "apktool.yml").write_text(
        """version: 2.11.1
apkFileName: mizan-unsigned.apk
isFrameworkApk: false
usesFramework:
  ids:
  - 1
sdkInfo:
  minSdkVersion: 21
  targetSdkVersion: 34
packageInfo:
  forcedPackageId: '127'
versionInfo:
  versionName: 1.0.0
  versionCode: 1
doNotCompress:
- resources.arsc
- png
- jpg
- jpeg
- json
- js
- css
- html
- svg
- webp
- dex
- webmanifest
""",
        encoding="utf-8",
    )


def copy_www(html: str):
    www = WORK / "assets/www"
    if www.exists():
        shutil.rmtree(www)
    www.mkdir(parents=True)
    src = STATIC if STATIC.exists() else PUBLIC
    skip = {".apk", ".map"}
    if src.exists():
        for p in src.rglob("*"):
            if p.is_dir():
                continue
            if p.suffix.lower() in skip:
                continue
            rel = p.relative_to(src)
            dest = www / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, dest)
    for extra in ("quran", "hisn", "brand", "mizan.css", "favicon.svg", "sw.js"):
        s = PUBLIC / extra
        d = www / extra
        if s.is_dir():
            if d.exists():
                continue
            shutil.copytree(s, d)
        elif s.is_file() and not d.exists():
            d.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(s, d)
    (www / "index.html").write_text(html, encoding="utf-8")


def fetch_html() -> str:
    for url in ("http://127.0.0.1:8081/", "http://127.0.0.1:8080/"):
        try:
            with urlopen(url, timeout=20) as r:
                raw = r.read().decode("utf-8", "replace")
            if "<html" in raw.lower() and "script" in raw.lower():
                html = re.sub(r"https?://127\.0\.0\.1:\d+", "", raw)
                html = re.sub(r"https?://0\.0\.0\.0:\d+", "", html)
                html = re.sub(r"https?://localhost:\d+", "", html)
                return html
        except Exception as e:
            print("html fetch failed", url, e, flush=True)
    return synthesize_html()


def synthesize_html() -> str:
    assets = STATIC / "assets" if (STATIC / "assets").exists() else None
    css = js = routes = ""
    if assets:
        for p in sorted(assets.iterdir()):
            name = p.name
            if name.startswith("styles-") and name.endswith(".css"):
                css = f"/assets/{name}"
            elif name.startswith("index-") and name.endswith(".js"):
                js = f"/assets/{name}"
            elif name.startswith("routes-") and name.endswith(".js"):
                routes = f"/assets/{name}"
    fonts = (
        "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700"
        "&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500"
        "&family=Fraunces:opsz,wght@9..144,500;9..144,600"
        "&family=IBM+Plex+Sans:wght@400;500"
        "&family=Literata:opsz,wght@7..72,400;7..72,600"
        "&family=Manrope:wght@400;500;600"
        "&family=Newsreader:opsz,wght@6..72,400;6..72,600"
        "&family=Noto+Naskh+Arabic:wght@400;700"
        "&family=Reem+Kufi:wght@400;500"
        "&family=Scheherazade+New:wght@400;700&display=swap"
    )
    pre = ""
    if routes:
        pre += f'<link rel="modulepreload" href="{routes}"/>'
    if js:
        pre += f'<link rel="modulepreload" href="{js}"/>'
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"/>
<title>Мизан — закят, Коран, Хисн, Иткан</title>
<meta name="theme-color" content="#04100c"/>
<meta name="color-scheme" content="dark"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
<link rel="stylesheet" href="{fonts}"/>
<link rel="stylesheet" href="/mizan.css"/>
{f'<link rel="stylesheet" href="{css}"/>' if css else ""}
{pre}
<style>html,body{{margin:0;min-height:100dvh;background:#04100c;color:#f8f4e9;font-family:Georgia,system-ui,sans-serif}}img{{max-width:100%;height:auto}}</style>
</head>
<body>
{f'<script type="module" src="{js}"></script>' if js else "<p style='padding:2rem;font-family:sans-serif'>Мизан</p>"}
</body>
</html>
"""


def seed_project():
    if WORK.exists():
        shutil.rmtree(WORK)
    WORK.mkdir(parents=True)
    shutil.copy2(ANDROID / "AndroidManifest.xml", WORK / "AndroidManifest.xml")
    shutil.copytree(ANDROID / "res", WORK / "res")
    original = WORK / "original"
    original.mkdir()
    (original / "META-INF").mkdir()
    (WORK / "smali").mkdir()


def build_unsigned() -> Path:
    unsigned = TOOLS / "mizan-unsigned.apk"
    if unsigned.exists():
        unsigned.unlink()
    run(["java", "-jar", str(APKTOOL), "b", str(WORK), "-f", "-o", str(unsigned)])
    if not unsigned.exists():
        raise SystemExit("apktool did not emit apk")
    return unsigned


def inject_dex(apk: Path, dex: Path) -> Path:
    out = TOOLS / "mizan-with-dex.apk"
    if out.exists():
        out.unlink()
    with zipfile.ZipFile(apk, "r") as zin, zipfile.ZipFile(out, "w") as zout:
        for item in zin.infolist():
            if item.filename == "classes.dex":
                continue
            zout.writestr(item, zin.read(item.filename))
        info = zipfile.ZipInfo("classes.dex")
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        zout.writestr(info, dex.read_bytes())
    return out


def sign(unsigned: Path) -> Path:
    out_dir = TOOLS / "signed"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir()
    run(
        [
            "java",
            "-jar",
            str(SIGNER),
            "-a",
            str(unsigned),
            "--ks",
            str(KS),
            "--ksAlias",
            KS_ALIAS,
            "--ksPass",
            KS_PASS,
            "--ksKeyPass",
            KS_PASS,
            "--out",
            str(out_dir),
        ]
    )
    signed = list(out_dir.glob("*.apk"))
    if not signed:
        raise SystemExit("signer produced no apk")
    signed.sort(key=lambda p: ("unsigned" in p.name, p.stat().st_size))
    return signed[-1]


def verify(apk: Path):
    with zipfile.ZipFile(apk) as z:
        names = z.namelist()
    need = ["classes.dex", "AndroidManifest.xml", "resources.arsc"]
    missing = [n for n in need if n not in names]
    if missing:
        raise SystemExit(f"apk missing {missing}")
    if not any(n.startswith("assets/www/") for n in names):
        raise SystemExit("apk missing bundled www assets")
    meta = [n for n in names if n.startswith("META-INF/")]
    if not meta:
        raise SystemExit("apk is not signed (no META-INF)")
    print("apk entries", len(names), "size", apk.stat().st_size, flush=True)
    print("META-INF", meta[:8], flush=True)


def main():
    for p in (APKTOOL, R8, ANDROID_JAR, SIGNER, SRC_JAVA):
        if not p.exists():
            raise SystemExit(f"missing {p}")
    ensure_keystore()
    seed_project()
    make_icons()
    write_apktool_yml()
    dex = compile_dex()
    html = fetch_html()
    copy_www(html)
    unsigned = inject_dex(build_unsigned(), dex)
    signed = sign(unsigned)
    OUT_APK.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(signed, OUT_APK)
    if STATIC.exists():
        shutil.copy2(signed, STATIC / "mizan.apk")
    artifacts = ROOT / "artifacts"
    artifacts.mkdir(exist_ok=True)
    shutil.copy2(signed, artifacts / "mizan.apk")
    verify(OUT_APK)
    print("WROTE", OUT_APK, OUT_APK.stat().st_size, flush=True)


if __name__ == "__main__":
    sys.exit(main())
