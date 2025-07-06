#!/usr/bin/env python3
"""
Analyze PDF visual style by converting pages to images
"""

import os
from pathlib import Path

try:
    from pdf2image import convert_from_path
    import PIL
except ImportError:
    print("Installing required packages...")
    os.system("pip3 install pdf2image pillow")
    from pdf2image import convert_from_path
    import PIL

def extract_pdf_pages():
    """Convert PDF pages to images for visual analysis"""
    pdf_dir = Path('/Users/graves/repos/archmajesty_tools/archmajesty-tools/public/books')
    output_dir = Path('/Users/graves/repos/archmajesty_tools/archmajesty-tools/pdf_screenshots')
    output_dir.mkdir(exist_ok=True)
    
    pdfs = {
        'core': pdf_dir / 'B-COR (AM25).pdf',
        'compendium': pdf_dir / 'B-COM (AM25).pdf',
        'sheet': pdf_dir / 'B-CHS (AM25).pdf'
    }
    
    for name, pdf_path in pdfs.items():
        if pdf_path.exists():
            print(f"Converting {name}...")
            try:
                # Convert specific pages that likely show the design language
                if name == 'core':
                    # Get cover, table of contents, and a few content pages
                    pages = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=5)
                elif name == 'compendium':
                    # Get cover and some spell card pages
                    pages = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=10)
                else:
                    # Character sheet - just first page
                    pages = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=1)
                
                for i, page in enumerate(pages):
                    output_path = output_dir / f"{name}_page_{i+1}.png"
                    page.save(output_path, 'PNG')
                    print(f"  Saved: {output_path}")
                    
                    # Also save a thumbnail for quick reference
                    thumb = page.copy()
                    thumb.thumbnail((400, 600), PIL.Image.Resampling.LANCZOS)
                    thumb_path = output_dir / f"{name}_page_{i+1}_thumb.png"
                    thumb.save(thumb_path, 'PNG')
                    
            except Exception as e:
                print(f"  Error: {e}")
                print("  Trying alternative method...")
                # Try using system command as fallback
                try:
                    os.system(f"sips -s format png '{pdf_path}' --out '{output_dir}/{name}_page_1.png' --pageIndex 1")
                except:
                    print("  Could not convert PDF. Please install poppler: brew install poppler")

def analyze_images():
    """Analyze the extracted images to identify design patterns"""
    output_dir = Path('/Users/graves/repos/archmajesty_tools/archmajesty-tools/pdf_screenshots')
    
    if output_dir.exists():
        images = list(output_dir.glob("*.png"))
        print(f"\nExtracted {len(images)} images for analysis")
        print("\nImages available at:")
        for img in sorted(images):
            if 'thumb' not in img.name:
                print(f"  {img}")

if __name__ == "__main__":
    print("Attempting to extract visual design from PDFs...")
    extract_pdf_pages()
    analyze_images()