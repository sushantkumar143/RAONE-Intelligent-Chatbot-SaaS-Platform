"""
RAONE - File Parser Utility
Extracts text from various file formats (PDF, DOCX, TXT) and URLs.
"""

import io
import PyPDF2
import docx
import requests
from bs4 import BeautifulSoup
import logging
from fastapi import UploadFile

logger = logging.getLogger(__name__)

async def extract_text_from_upload(file: UploadFile) -> str:
    """Extract text from an uploaded file based on its content type."""
    content = await file.read()
    filename = file.filename.lower()
    
    text = ""
    try:
        if filename.endswith(".pdf") or file.content_type == "application/pdf":
            logger.info(f"Parsing PDF file: {file.filename}")
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        
        elif filename.endswith(".docx") or file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            logger.info(f"Parsing DOCX file: {file.filename}")
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
                
        elif filename.endswith(".txt") or file.content_type == "text/plain":
            logger.info(f"Parsing TXT file: {file.filename}")
            text = content.decode('utf-8', errors='ignore')
            
        else:
            raise ValueError(f"Unsupported file type: {file.content_type} ({file.filename})")
            
        logger.info(f"Successfully extracted {len(text)} characters from {file.filename}")
        return text.strip()
        
    except Exception as e:
        logger.error(f"Error parsing file {file.filename}: {e}")
        raise ValueError(f"Failed to parse file {file.filename}: {str(e)}")

def extract_text_from_url(url: str) -> tuple[str, str]:
    """Scrape a URL and return a tuple of (title, readable_text)."""
    logger.info(f"Scraping URL: {url}")
    try:
        response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script, style, and navigation elements
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
            
        title = soup.title.string if soup.title else url
        
        # Get text and clean up whitespace
        text = soup.get_text(separator=' ')
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        logger.info(f"Successfully scraped URL. Title: {title}. Length: {len(text)}")
        return title, text
        
    except Exception as e:
        logger.error(f"Error scraping URL {url}: {e}")
        raise ValueError(f"Failed to scrape URL {url}: {str(e)}")
