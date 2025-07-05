import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFParser {
  private pdfDoc: any | null = null;

  async loadPDF(data: ArrayBuffer): Promise<void> {
    const loadingTask = pdfjsLib.getDocument({ data });
    this.pdfDoc = await loadingTask.promise;
  }

  async extractAllText(): Promise<string> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }

    let fullText = '';
    const numPages = this.pdfDoc.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await this.pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }

    return fullText;
  }

  async extractTextByPage(): Promise<string[]> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }

    const pages: string[] = [];
    const numPages = this.pdfDoc.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await this.pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      pages.push(pageText);
    }

    return pages;
  }

  async extractStructuredText(): Promise<{ pageNumber: number; text: string; lines: string[] }[]> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }

    const structuredPages: { pageNumber: number; text: string; lines: string[] }[] = [];
    const numPages = this.pdfDoc.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await this.pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group text items by their y position to reconstruct lines
      const lineMap = new Map<number, string[]>();
      
      textContent.items.forEach((item: any) => {
        const y = Math.round(item.transform[5]);
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push(item.str);
      });

      // Sort lines by y position (descending, as PDF coordinates start from bottom)
      const sortedLines = Array.from(lineMap.entries())
        .sort(([y1], [y2]) => y2 - y1)
        .map(([_, texts]) => texts.join(' ').trim())
        .filter(line => line.length > 0);

      const pageText = sortedLines.join('\n');
      
      structuredPages.push({
        pageNumber: pageNum,
        text: pageText,
        lines: sortedLines
      });
    }

    return structuredPages;
  }

  getPageCount(): number {
    return this.pdfDoc?.numPages || 0;
  }
}