from pathlib import Path
import json
import re
import unicodedata
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
VIDEOS = ROOT / 'videos.txt'
IMAGES = ROOT / 'imagens'
OPTIMIZED = IMAGES / 'optimized'
OUT = ROOT / 'gallery-data.js'

IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'}
EXCLUDED_IMAGES = {
    '20260430_194126.png',
    'preview-card.png',
    'gao-portfolio-preview.jpg',
    'profile.png',
    'perfil.png',
    'foto.png',
    'avatar.png',
}

VIDEO_META = {
    'psM8ihpdWho': {
        'title': 'Best Edit — Horror Games Video Essay',
        'category': 'featured',
        'categories': ['featured', 'youtube', 'essay', 'motion', 'gaming'],
        'platform': 'Featured YouTube Essay',
        'caption': 'One of my strongest edits: PT-BR horror games essay with 3D, VFX, motion, pacing and storytelling.',
        'skills': ['3D', 'VFX', 'Motion', 'Retention', 'Horror'],
    },
    'bBp-xRQ1HFw': {
        'title': 'Purple Guy FNAF — Pixel Art + 3D Edit',
        'category': 'featured',
        'categories': ['featured', 'motion', 'gaming', 'shorts'],
        'platform': 'Pixel Art / 3D / AE',
        'caption': 'FNAF edit mixing pixel art, 3D elements and After Effects motion for a premium horror-game look.',
        'skills': ['Pixel art', '3D', 'After Effects', 'Horror'],
    },
    'a9qNC0mtvWY': {
        'title': 'KinitoPET Lore — 3D/VFX VRChat TikTok',
        'category': 'shorts',
        'categories': ['featured', 'shorts', 'motion', 'gaming'],
        'platform': 'TikTok Lore / VFX',
        'caption': 'Short-form lore video using 3D, VFX and VRChat style staging to make the story feel visual and weird.',
        'skills': ['3D', 'VFX', 'VRChat', 'Lore'],
    },
    '5aL2FJyFrxA': {
        'title': 'Death Note — Motion Manga Edit',
        'category': 'motion',
        'categories': ['motion', 'shorts', 'featured'],
        'platform': 'Motion Manga',
        'caption': 'Manga panels, dramatic movement, rhythm, cuts and sound sync made for anime-style retention.',
        'skills': ['Motion manga', 'Anime', 'Sound sync'],
    },
    'AqpRU6mkEj4': {
        'title': "It's Been So Long — Pixel Art Motion Edit",
        'category': 'motion',
        'categories': ['motion', 'shorts', 'gaming'],
        'platform': 'Pixel Art Motion',
        'caption': 'Pixel art and motion timing built around music, atmosphere and internet nostalgia.',
        'skills': ['Pixel art', 'Motion', 'Music sync'],
    },
    'd1msns3xFyA': {
        'title': 'Rentune — Fears to Fathom Story Video',
        'category': 'essay',
        'categories': ['youtube', 'essay', 'gaming'],
        'platform': 'Game Story / YouTube',
        'caption': 'Narrative edit explaining the game story with pacing, structure, cuts and atmosphere for retention.',
        'skills': ['Story', 'Gaming', 'Pacing'],
    },
    'VSOYV34zxyI': {
        'title': 'agoodgamer — Mouse PI For Hire Platinum',
        'category': 'gaming',
        'categories': ['youtube', 'gaming'],
        'platform': 'YouTube Gaming',
        'caption': 'Challenge/platinum-style YouTube video edit for agoodgamer, focused on clean pacing and watchability.',
        'skills': ['YouTube', 'Gaming', 'Challenge'],
    },
    'uZeU9dMsBFM': {
        'title': 'Backrooms: Escape Together — Gameplay Edit',
        'category': 'gaming',
        'categories': ['gaming', 'youtube'],
        'platform': 'Gameplay / Horror',
        'caption': 'Gameplay edit for Backrooms: Escape Together with tension, cuts and atmosphere.',
        'skills': ['Gameplay', 'Horror', 'Pacing'],
    },
    'EnCmrxVDQV0': {
        'title': 'Quest 2 VR — Tech TikTok',
        'category': 'shorts',
        'categories': ['shorts', 'tech'],
        'platform': 'TikTok / Tech',
        'caption': 'Short tech content about Quest 2 VR: clear topic, fast delivery and social-friendly edit.',
        'skills': ['TikTok', 'VR', 'Tech'],
    },
    '1RF0AhmF1-M': {
        'title': 'WoW Corrupted Blood — Lore TikTok',
        'category': 'shorts',
        'categories': ['shorts', 'essay', 'gaming'],
        'platform': 'TikTok Lore',
        'caption': 'Short-form explainer about the corrupted blood epidemic in WoW, edited for curiosity and retention.',
        'skills': ['Lore', 'Explainer', 'Gaming'],
    },
    'dusiBX59v2c': {
        'title': 'Reflective Story Video — Clean Narrative Edit',
        'category': 'essay',
        'categories': ['youtube', 'essay'],
        'platform': 'Narrative YouTube',
        'caption': 'More recording-focused and reflective, but organized with clean structure, pacing and visual clarity.',
        'skills': ['Narrative', 'Organization', 'Clean cuts'],
    },
}

SPECIAL_IMAGE_META = {
    '0ee6b8173442685-67c8b60b806f8': ('Cursor hacker icon', 'brand', 'Brand / Icon', 'Tech/hacker cursor icon for profile, overlay or brand asset'),
    '7759e6173442685-67c8b60b801cf': ('Glitch logo mark', 'brand', 'Logo / Graphic', 'Glitch-styled logo mark with strong contrast and internet energy'),
    'dedtech-png-transa': ('DedTech tech banner', 'brand', 'Brand / Banner', 'Tech-service banner with retro cyber aesthetic and readable offer'),
    'designador-1': ('Designador professional graphic', 'brand', 'Title / Graphic', 'Title card / professional graphic for portfolio or content branding'),
    '51e878173442685-67c8b60b7ecc7': ('Red glitch character icon', 'identity', 'Identity / Character', 'Red glitch character portrait for avatar or dark creator identity'),
    'colageno-1': ('Blue glitch character cover', 'identity', 'Identity / Character', 'Blue glitch character piece for creator branding and profile visuals'),
    'gaojoia69': ('Gao Joia mask avatar', 'identity', 'Identity / Character', 'Masked avatar identity with neon/glitch creator personality'),
    'jonan-falante': ('Jonan DR avatar identity', 'identity', 'Identity / Character', 'Creator avatar/mascot for channel identity and social presence'),
    'cover-intenso-album': ('Intenso album cover', 'cover', 'Cover / Social', 'Dark album-cover style artwork with premium mood and texture'),
    'dream': ('Dream surreal social art', 'cover', 'Cover / Social', 'Surreal square artwork for social posts, covers or campaign visuals'),
    'gunrun-thumb': ('Gun Run gaming thumbnail', 'thumbnail', 'Thumbnail', 'Gaming thumbnail with clear character, title and action cue'),
    'loucura-superman-tristesa': ('Superman dark story thumbnail', 'thumbnail', 'Thumbnail', 'Narrative dark thumbnail built for curiosity and high click intent'),
    'minecraft-solitario': ('Minecraft lonely thumbnail', 'thumbnail', 'Thumbnail', 'Minecraft story thumbnail with emotional title and simple readable concept'),
    'teste-fnaf': ('FNAF glitch thumbnail', 'thumbnail', 'Thumbnail', 'Horror gaming thumbnail with glitch contrast and recognizable character focus'),
    'thumb-coach': ('Coach glitch thumbnail', 'thumbnail', 'Thumbnail', 'Internet mystery/creepypasta-style thumbnail with strong glitch mood'),
    'thumb-iceberg-minecraft': ('Minecraft iceberg thumbnail', 'thumbnail', 'Thumbnail', 'Iceberg-style gaming thumbnail for mystery/lore videos'),
    'thumb-project-kat': ('Project Kat anime thumbnail', 'thumbnail', 'Thumbnail', 'Anime/horror thumbnail with saturated colors and character emotion'),
}

DEFAULT_VIDEO_BUCKETS = [
    ('Hook-first short edit', 'shorts', ['shorts'], 'Shorts/TikTok'),
    ('YouTube retention edit', 'youtube', ['youtube'], 'YouTube'),
    ('Motion/VFX rhythm edit', 'motion', ['motion'], 'Motion/VFX'),
    ('Gaming/internet pacing edit', 'gaming', ['gaming'], 'Gaming'),
]

def slugify(name: str) -> str:
    stem = Path(name).stem
    stem = unicodedata.normalize('NFKD', stem).encode('ascii', 'ignore').decode('ascii')
    stem = re.sub(r'[^a-zA-Z0-9]+', '-', stem).strip('-').lower()
    return stem or 'image'

def youtube_id(url: str) -> str:
    url = (url or '').strip()
    for pattern in (r'watch\?v=([^&\s#]+)', r'youtu\.be/([^?&\s#]+)', r'embed/([^?&\s#]+)', r'shorts/([^?&\s#]+)'):
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return url if re.match(r'^[a-zA-Z0-9_-]{8,}$', url) else ''

def clean_video_line(line: str) -> str:
    # Allows comments like: URL # description
    return line.split('#', 1)[0].strip()

def clean_name(path: Path) -> str:
    name = path.stem.replace('-', ' ').replace('_', ' ')
    name = re.sub(r'\s*\(\d+\)\s*', ' ', name)
    return re.sub(r'\s+', ' ', name).strip()

def title_from_name(path: Path) -> str:
    slug = slugify(path.name)
    if slug in SPECIAL_IMAGE_META:
        return SPECIAL_IMAGE_META[slug][0]
    name = clean_name(path)
    return name[:1].upper() + name[1:] if name else 'Design asset'

def categorize_image(path: Path, size):
    name = slugify(path.name)
    if name in SPECIAL_IMAGE_META:
        _title, category, label, description = SPECIAL_IMAGE_META[name]
        return category, label, description
    w, h = size
    ratio = (w / h) if h else 1
    if 'thumb' in name or ratio > 1.55 or any(k in name for k in ['minecraft', 'fnaf', 'gunrun', 'project-kat', 'superman']):
        return 'thumbnail', 'Thumbnail', 'Clickable YouTube/video thumbnail'
    if any(k in name for k in ['cover', 'album', 'dream']) or .85 <= ratio <= 1.15:
        if any(k in name for k in ['gaojoia', 'jonan', 'colageno', '51e878', 'red']):
            return 'identity', 'Identity / Character', 'Creator identity / character asset'
        return 'cover', 'Cover / Social', 'Cover art or square social visual'
    if any(k in name for k in ['dedtech', 'designador', '0ee6', '7759']):
        return 'brand', 'Brand / Graphic', 'Brand, title card or graphic asset'
    return 'brand', 'Brand / Graphic', 'Visual graphic asset'

def clean_alt(path: Path, label: str) -> str:
    return f'{title_from_name(path)} by Gao — {label}'

def optimize_image(path: Path):
    """Create a lightweight WebP copy when Pillow is available. Falls back safely."""
    try:
        from PIL import Image
        OPTIMIZED.mkdir(exist_ok=True)
        im = Image.open(path).convert('RGB')
        max_dim = 1400
        im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        out = OPTIMIZED / f'{slugify(path.name)}.webp'
        im.save(out, 'WEBP', quality=82, method=6)
        return out, im.size
    except Exception:
        try:
            from PIL import Image
            im = Image.open(path)
            return None, im.size
        except Exception:
            return None, (0, 0)

videos = []
if VIDEOS.exists():
    for raw in VIDEOS.read_text(encoding='utf-8').splitlines():
        line = clean_video_line(raw)
        if line:
            vid = youtube_id(line)
            if vid in VIDEO_META:
                item = {'url': line, **VIDEO_META[vid]}
            else:
                title, category, categories, platform = DEFAULT_VIDEO_BUCKETS[len(videos) % len(DEFAULT_VIDEO_BUCKETS)]
                item = {
                    'url': line,
                    'title': title,
                    'category': category,
                    'categories': categories,
                    'platform': platform,
                    'caption': 'Click to watch the full edit.',
                    'skills': ['Hook', 'Pacing'],
                }
            videos.append(item)

images = []
if IMAGES.exists():
    for path in sorted(IMAGES.iterdir(), key=lambda p: p.name.lower()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in IMAGE_EXTS:
            continue
        if path.name in EXCLUDED_IMAGES:
            continue
        optimized, size = optimize_image(path)
        category, label, description = categorize_image(path, size)
        item = {
            'src': 'imagens/optimized/' + quote(optimized.name) if optimized else 'imagens/' + quote(path.name),
            'width': size[0],
            'height': size[1],
            'alt': clean_alt(path, label),
            'title': title_from_name(path),
            'category': category,
            'label': label,
            'description': description,
        }
        if optimized:
            item['fallback'] = 'imagens/' + quote(path.name)
        images.append(item)

content = 'window.GAO_VIDEOS = ' + json.dumps(videos, ensure_ascii=False, indent=2) + ';\n\n'
content += 'window.GAO_IMAGES = ' + json.dumps(images, ensure_ascii=False, indent=2) + ';\n'
OUT.write_text(content, encoding='utf-8')
print(f'OK: {len(videos)} vídeos e {len(images)} imagens salvos em {OUT.name}')
