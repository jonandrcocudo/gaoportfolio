#!/usr/bin/env python3
"""
Baixa todos os vídeos usados no portfolio do Gao.

Como usar no terminal dentro da pasta do site:
  python baixar_videos_portfolio.py

Se aparecer erro dizendo que falta yt-dlp:
  python -m pip install -U yt-dlp
  python baixar_videos_portfolio.py

Opções úteis:
  python baixar_videos_portfolio.py --only-list       # só extrai os links
  python baixar_videos_portfolio.py --max-height 720  # arquivos menores
  python baixar_videos_portfolio.py --install         # tenta instalar/atualizar yt-dlp
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent
DEFAULT_FILES = [
    ROOT / "videos.txt",
    ROOT / "gallery-data.js",
    ROOT / "index.html",
]
YOUTUBE_RE = re.compile(
    r"https?://(?:www\.)?(?:youtube\.com/(?:watch\?[^\s'\"<>]+|shorts/[^\s'\"<>]+|embed/[^\s'\"<>]+)|youtu\.be/[^\s'\"<>]+)",
    re.IGNORECASE,
)


def normalize_youtube_url(url: str) -> str:
    """Remove lixo de HTML/JS e transforma em URL watch normal quando possível."""
    url = url.strip().strip("'\"),;]")
    url = url.replace("&amp;", "&")
    parsed = urlparse(url)
    host = parsed.netloc.lower().replace("www.", "")
    video_id = ""

    if host == "youtu.be":
        video_id = parsed.path.strip("/").split("/")[0]
    elif host.endswith("youtube.com"):
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [""])[0]
        elif parsed.path.startswith("/shorts/") or parsed.path.startswith("/embed/"):
            video_id = parsed.path.strip("/").split("/")[1]

    if video_id:
        return f"https://www.youtube.com/watch?v={video_id}"
    return url


def extract_urls(files: list[Path]) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    for file in files:
        if not file.exists():
            continue
        text = file.read_text(encoding="utf-8", errors="ignore")
        for match in YOUTUBE_RE.findall(text):
            url = normalize_youtube_url(match)
            # Ignore editable placeholders until you paste a real YouTube URL.
            if any(token in url.upper() for token in ("COLOQUE", "SUBSTITUA", "REPLACE", "YOUTUBE_ID")):
                continue
            if url and url not in seen:
                seen.add(url)
                urls.append(url)
    return urls


def ensure_ytdlp(install: bool) -> bool:
    if shutil.which("yt-dlp"):
        return True
    try:
        subprocess.run([sys.executable, "-m", "yt_dlp", "--version"], check=True, stdout=subprocess.DEVNULL)
        return True
    except Exception:
        pass

    if install:
        print("yt-dlp não encontrado. Instalando/atualizando com pip...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-U", "yt-dlp"])
        return True
    return False


def ytdlp_command(urls: list[str], output_dir: Path, max_height: int) -> list[str]:
    fmt = f"bestvideo[height<={max_height}][ext=mp4]+bestaudio[ext=m4a]/best[height<={max_height}][ext=mp4]/best"
    base = [
        "yt-dlp" if shutil.which("yt-dlp") else sys.executable,
    ]
    if base[0] == sys.executable:
        base += ["-m", "yt_dlp"]
    base += [
        "--ignore-errors",
        "--no-overwrites",
        "--continue",
        "--write-thumbnail",
        "--convert-thumbnails", "jpg",
        "--download-archive", str(output_dir / "baixados.txt"),
        "-f", fmt,
        "-o", str(output_dir / "%(playlist_index|00)s_%(title).120s_%(id)s.%(ext)s"),
    ]
    return base + urls


def main() -> int:
    parser = argparse.ArgumentParser(description="Extrai e baixa vídeos do portfolio do Gao.")
    parser.add_argument("--only-list", action="store_true", help="Só extrai os links, sem baixar.")
    parser.add_argument("--install", action="store_true", help="Tenta instalar/atualizar yt-dlp se não existir.")
    parser.add_argument("--max-height", type=int, default=1080, help="Altura máxima do vídeo. Padrão: 1080.")
    parser.add_argument("--out", default="downloads_portfolio", help="Pasta de saída. Padrão: downloads_portfolio.")
    args = parser.parse_args()

    urls = extract_urls(DEFAULT_FILES)
    out_dir = ROOT / args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    txt = ROOT / "urls_extraidos_portfolio.txt"
    manifest = ROOT / "urls_extraidos_portfolio.json"
    txt.write_text("\n".join(urls) + "\n", encoding="utf-8")
    manifest.write_text(json.dumps({"count": len(urls), "urls": urls}, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Encontrados {len(urls)} vídeos.")
    print(f"Lista salva em: {txt.name}")
    print(f"Manifest salvo em: {manifest.name}")

    if not urls:
        print("Nenhum link de vídeo encontrado.")
        return 1
    if args.only_list:
        return 0

    if not ensure_ytdlp(args.install):
        print("\nyt-dlp não encontrado.")
        print("Instale com: python -m pip install -U yt-dlp")
        print("Depois rode novamente: python baixar_videos_portfolio.py")
        return 2

    cmd = ytdlp_command(urls, out_dir, args.max_height)
    print(f"\nBaixando em: {out_dir}")
    print("Dica: para baixar mais leve, use --max-height 720")
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
