"""
RAONE - Text Processing Utilities
Text cleaning, chunking helpers, etc.
"""

import re
from typing import List


def clean_text(text: str) -> str:
    """Clean raw text for processing."""
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    # Remove null bytes
    text = text.replace('\x00', '')
    # Strip leading/trailing whitespace
    text = text.strip()
    return text


def estimate_tokens(text: str) -> int:
    """Rough token count estimation (1 token ≈ 4 chars)."""
    return len(text) // 4


def truncate_text(text: str, max_chars: int = 500) -> str:
    """Truncate text to a max character count with ellipsis."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(' ', 1)[0] + "..."


def extract_title_from_text(text: str, max_length: int = 100) -> str:
    """Extract a title from the first meaningful line of text."""
    lines = text.strip().split('\n')
    for line in lines:
        cleaned = line.strip()
        if len(cleaned) > 5:
            return cleaned[:max_length]
    return "Untitled"
