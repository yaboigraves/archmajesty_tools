#!/usr/bin/env python3
import PyPDF2
import os
import sys

def extract_pdf_text(pdf_path, output_path):
    """Extract text from PDF and save to file"""
    try:
        with open(pdf_path, 'rb') as file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Get total number of pages
            num_pages = len(pdf_reader.pages)
            print(f"Processing {pdf_path}: {num_pages} pages")
            
            # Extract text from all pages
            full_text = []
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                full_text.append(f"\n--- PAGE {page_num + 1} ---\n")
                full_text.append(text)
            
            # Save to output file
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(''.join(full_text))
            
            print(f"Extracted text saved to: {output_path}")
            return True
            
    except Exception as e:
        print(f"Error processing {pdf_path}: {str(e)}")
        return False

def main():
    # Define PDF files and their output paths
    pdf_dir = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/public/books"
    output_dir = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/extracted_text"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    pdf_files = {
        "B-COR (AM25).pdf": "COR_extracted.txt",
        "B-COM (AM25).pdf": "COM_extracted.txt",
        "B-CHS (AM25).pdf": "CHS_extracted.txt"
    }
    
    # Extract each PDF
    for pdf_name, output_name in pdf_files.items():
        pdf_path = os.path.join(pdf_dir, pdf_name)
        output_path = os.path.join(output_dir, output_name)
        
        if os.path.exists(pdf_path):
            extract_pdf_text(pdf_path, output_path)
        else:
            print(f"PDF not found: {pdf_path}")

if __name__ == "__main__":
    main()