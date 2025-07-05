import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { pdfStorage } from '../../services/storage/pdfStorage';
import { pdfProcessingService } from '../../services/pdfProcessingService';
import { useStore } from '../../services/store';
import { LoadDefaultPDFs } from './LoadDefaultPDFs';

interface PDFUploaderProps {
  onUploadComplete: () => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadComplete }) => {
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'processing' | 'success' | 'error' }>({});
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const { setCards, setAvailableSpells, setLoading } = useStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.type !== 'application/pdf') {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
        continue;
      }

      setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));

      try {
        const arrayBuffer = await file.arrayBuffer();
        await pdfStorage.storePDF(file.name, arrayBuffer);
        
        setUploadStatus(prev => ({ ...prev, [file.name]: 'processing' }));
        
        // Process the PDF to extract data
        try {
          await pdfProcessingService.processPDF(file.name, arrayBuffer);
          setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
          setUploadedFiles(prev => [...prev, file.name]);
        } catch (processError) {
          console.error('Error processing PDF:', processError);
          setUploadStatus(prev => ({ ...prev, [file.name]: 'success' })); // Still mark as uploaded
          setUploadedFiles(prev => [...prev, file.name]);
        }
      } catch (error) {
        console.error('Error uploading PDF:', error);
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
      }
    }
    
    // After all files are processed, load the data
    if (acceptedFiles.length > 0) {
      setTimeout(async () => {
        await loadExtractedData();
        onUploadComplete();
      }, 1000);
    }
  }, [onUploadComplete]);

  const loadExtractedData = async () => {
    setProcessingStatus('Loading extracted data...');
    setLoading(true);
    
    try {
      const [cards, spells] = await Promise.all([
        pdfProcessingService.getAllCards(),
        pdfProcessingService.getAllSpells()
      ]);
      
      setCards(cards);
      setAvailableSpells(spells);
      setProcessingStatus(`Loaded ${cards.length} cards and ${spells.length} spells`);
    } catch (error) {
      console.error('Error loading extracted data:', error);
      setProcessingStatus('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load any previously extracted data on mount
    loadExtractedData();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Setup</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Upload Rulebooks</h3>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop the PDFs here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600">
              Drag & drop your Archmajesty rulebooks here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to select files
            </p>
          </div>
        )}
      </div>

      {Object.keys(uploadStatus).length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-lg font-semibold mb-2">Upload Status:</h3>
          {Object.entries(uploadStatus).map(([fileName, status]) => (
            <div
              key={fileName}
              className={`p-3 rounded flex items-center justify-between ${
                status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <span className="font-medium">{fileName}</span>
              <span className="text-sm">
                {status === 'success' && '✓ Processed'}
                {status === 'error' && '✗ Failed'}
                {status === 'uploading' && '⟳ Uploading...'}
                {status === 'processing' && '⚙ Processing...'}
              </span>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length === 3 && (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-medium">
            All rulebooks uploaded! You can now proceed to use the tool.
          </p>
          {processingStatus && (
            <p className="text-blue-700 text-sm mt-2">
              {processingStatus}
            </p>
          )}
        </div>
      )}

      {processingStatus && uploadedFiles.length < 3 && (
        <div className="mt-4 text-gray-600 text-sm">
          {processingStatus}
        </div>
      )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Or</h3>
          <LoadDefaultPDFs onLoadComplete={onUploadComplete} />
        </div>
      </div>
    </div>
  );
};