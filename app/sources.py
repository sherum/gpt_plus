import re
from pathlib import Path

from pypdf import PdfReader

SOURCES_DIR = Path(__file__).resolve().parent.parent / "sources"


def resolve(relative: str) -> Path:
    """Resolve a path relative to the sources directory, rejecting anything outside it."""
    path = (SOURCES_DIR / relative).resolve()
    if not path.is_relative_to(SOURCES_DIR):
        raise ValueError(f"Path outside sources directory: {relative}")
    return path


def list_folders() -> list[str]:
    """Return the selectable folders: '' for the sources root plus each subfolder."""
    subfolders = sorted(
        p.name for p in SOURCES_DIR.iterdir() if p.is_dir() and not p.name.startswith(".")
    )
    return ["", *subfolders]


def list_sources(folder: str = "") -> list[str]:
    """Return the paths, relative to the sources directory, of the documents in a folder."""
    directory = resolve(folder)
    return sorted(
        str(p.relative_to(SOURCES_DIR))
        for p in directory.iterdir()
        if p.is_file() and not p.name.startswith(".")
    )


def read_source(relative: str) -> str:
    """Return the text content of a source document, extracting PDF text as needed."""
    path = resolve(relative)
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    return path.read_text()


def create_source(content: str, folder: str = "") -> str:
    """Write content to a new source file in a folder, deriving the filename from its first line."""
    first_line = next((line.strip() for line in content.splitlines() if line.strip()), "untitled")
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", first_line).strip("_") or "untitled"
    directory = resolve(folder)
    path = directory / f"{slug}.txt"
    counter = 2
    while path.exists():
        path = directory / f"{slug}_{counter}.txt"
        counter += 1
    path.write_text(content)
    return str(path.relative_to(SOURCES_DIR))
