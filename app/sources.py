import re
from pathlib import Path

from pypdf import PdfReader

SOURCES_DIR = Path(__file__).resolve().parent.parent / "sources"


def list_sources() -> list[str]:
    """Return the filenames of available world-building source documents."""
    return sorted(p.name for p in SOURCES_DIR.iterdir() if p.is_file() and not p.name.startswith("."))


def read_source(filename: str) -> str:
    """Return the text content of a source document, extracting PDF text as needed."""
    path = SOURCES_DIR / filename
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    return path.read_text()


def create_source(content: str) -> str:
    """Write content to a new source file, deriving the filename from its first line."""
    first_line = next((line.strip() for line in content.splitlines() if line.strip()), "untitled")
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", first_line).strip("_") or "untitled"
    filename = f"{slug}.txt"
    path = SOURCES_DIR / filename
    counter = 2
    while path.exists():
        filename = f"{slug}_{counter}.txt"
        path = SOURCES_DIR / filename
        counter += 1
    path.write_text(content)
    return filename
