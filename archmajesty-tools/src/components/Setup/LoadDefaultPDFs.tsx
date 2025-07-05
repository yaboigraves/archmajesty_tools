import React, { useState } from 'react';
import { pdfStorage } from '../../services/storage/pdfStorage';
import { pdfProcessingService } from '../../services/pdfProcessingService';
import { useStore } from '../../services/store';

interface LoadDefaultPDFsProps {
  onLoadComplete: () => void;
}

export const LoadDefaultPDFs: React.FC<LoadDefaultPDFsProps> = ({ onLoadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const { setCards, setAvailableSpells, setLoading: setGlobalLoading } = useStore();

  const defaultPDFs = [
    '/books/B-CHS (AM25).pdf',
    '/books/B-COM (AM25).pdf',
    '/books/B-COR (AM25).pdf'
  ];

  const loadDefaultPDFs = async () => {
    setLoading(true);
    setGlobalLoading(true);
    setStatus('Loading default PDFs...');

    try {
      for (const pdfPath of defaultPDFs) {
        const fileName = pdfPath.split('/').pop() || '';
        setStatus(`Loading ${fileName}...`);

        try {
          // Fetch the PDF from public folder
          const response = await fetch(pdfPath);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${pdfPath}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          
          // Store in IndexedDB
          await pdfStorage.storePDF(fileName, arrayBuffer);
          
          // Process the PDF
          setStatus(`Processing ${fileName}...`);
          await pdfProcessingService.processPDF(fileName, arrayBuffer);
        } catch (error) {
          console.error(`Error loading ${fileName}:`, error);
          setStatus(`Error loading ${fileName}`);
        }
      }

      // Load all extracted data
      setStatus('Loading extracted data...');
      const [cards, spells] = await Promise.all([
        pdfProcessingService.getAllCards(),
        pdfProcessingService.getAllSpells()
      ]);

      setCards(cards);
      setAvailableSpells(spells);
      setStatus(`Loaded ${cards.length} cards and ${spells.length} spells`);
      
      setTimeout(() => {
        onLoadComplete();
      }, 1000);
    } catch (error) {
      console.error('Error loading default PDFs:', error);
      setStatus('Error loading PDFs');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
      <p className="text-gray-600 mb-4">
        Load the default rulebooks from the public folder to get started quickly.
      </p>
      
      <button
        onClick={loadDefaultPDFs}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {loading ? 'Loading...' : 'Load Default PDFs'}
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-600">{status}</p>
      )}
    </div>
  );
};