import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from './ui/scroll-area';

interface PDFValidatorProps {
  onPDFLoaded: (text: string) => void;
}

export function PDFValidator({ onPDFLoaded }: PDFValidatorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsLoading(true);
    toast.loading('Loading PDF...');

    try {
      const text = await extractTextFromPDF(file);
      onPDFLoaded(text);
      toast.success('PDF loaded successfully!');
    } catch (error) {
      toast.error('Failed to load PDF');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [onPDFLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-muted'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
              <p>Loading PDF...</p>
            </>
          ) : (
            <>
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to select a file
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}