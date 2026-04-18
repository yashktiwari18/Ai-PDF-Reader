"""
Service: pdf_reader.py
Extracts raw text from a PDF file using PyMuPDF (fitz).
"""

import fitz  # PyMuPDF


def extract_text_from_pdf(file_path: str) -> str:
    """
    Open a PDF from `file_path` and return all text content
    concatenated across every page.

    Args:
        file_path: Absolute or relative path to the PDF file.

    Returns:
        A single string containing the extracted text.

    Raises:
        FileNotFoundError: If the PDF does not exist at the given path.
        RuntimeError: If PyMuPDF fails to open / parse the file.
    """
    try:
        doc = fitz.open(file_path)
    except Exception as exc:
        raise RuntimeError(f"Failed to open PDF '{file_path}': {exc}") from exc

    pages_text: list[str] = []

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text")  # plain text extraction
        if text.strip():
            pages_text.append(f"[Page {page_num}]\n{text.strip()}")

    doc.close()

    if not pages_text:
        return ""

    return "\n\n".join(pages_text)


def get_page_count(file_path: str) -> int:
    """Return the number of pages in the PDF."""
    with fitz.open(file_path) as doc:
        return doc.page_count
