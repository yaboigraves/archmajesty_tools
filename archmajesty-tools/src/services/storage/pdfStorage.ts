const DB_NAME = 'archmajesty-tools';
const DB_VERSION = 1;
const PDF_STORE = 'pdfs';
const DATA_STORE = 'extractedData';

interface StoredPDF {
  name: string;
  data: ArrayBuffer;
  uploadDate: Date;
}

class PDFStorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(PDF_STORE)) {
          db.createObjectStore(PDF_STORE, { keyPath: 'name' });
        }
        
        if (!db.objectStoreNames.contains(DATA_STORE)) {
          db.createObjectStore(DATA_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async storePDF(name: string, data: ArrayBuffer): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([PDF_STORE], 'readwrite');
    const store = transaction.objectStore(PDF_STORE);
    
    const pdf: StoredPDF = {
      name,
      data,
      uploadDate: new Date()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(pdf);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPDF(name: string): Promise<StoredPDF | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([PDF_STORE], 'readonly');
    const store = transaction.objectStore(PDF_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(name);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPDFs(): Promise<StoredPDF[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([PDF_STORE], 'readonly');
    const store = transaction.objectStore(PDF_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async storeExtractedData(id: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([DATA_STORE], 'readwrite');
    const store = transaction.objectStore(DATA_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put({ id, data, timestamp: new Date() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getExtractedData(id: string): Promise<any> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([DATA_STORE], 'readonly');
    const store = transaction.objectStore(DATA_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const pdfStorage = new PDFStorageService();