import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, FileAudio, FilePdf, Check } from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { transcribeAudio, validateTranscriptWithClaude } from '@/lib/api';
import { TranscriptWord, ValidationResult } from '@/lib/types';
import { toast } from 'sonner';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface TranscriptionPanelProps {
  onPromptsGenerated: (prompts: string[]) => void;
}

export function TranscriptionPanel({ onPromptsGenerated }: TranscriptionPanelProps) {
  const [transcript, setTranscript] = useState<{
    text: string;
    words: TranscriptWord[];
  } | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [pdfText, setPdfText] = useState<string>('');
  const [editedTranscript, setEditedTranscript] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const onAudioDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsTranscribing(true);
    try {
      const result = await transcribeAudio(file);
      setTranscript(result);
      setEditedTranscript(result.text);
      toast.success('Audio transcribed successfully');
    } catch (error) {
      toast.error('Failed to transcribe audio');
      console.error(error);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const onPdfDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      setPdfText(fullText);
      toast.success('PDF loaded successfully');
    } catch (error) {
      toast.error('Failed to load PDF');
      console.error(error);
    }
  }, []);

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps } = useDropzone({
    accept: { 'audio/mp3': ['.mp3'] },
    maxFiles: 1,
    onDrop: onAudioDrop
  });

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: onPdfDrop
  });

  const handleValidate = async () => {
    if (!transcript || !pdfText) {
      toast.error('Please upload both audio and PDF files first');
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateTranscriptWithClaude(editedTranscript, pdfText);
      setValidationResult(result);
      onPromptsGenerated(result.thumbnailPrompts);
      toast.success('Validation completed');
    } catch (error) {
      toast.error('Validation failed');
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Audio Upload */}
        <Card
          {...getAudioRootProps()}
          className="p-6 border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getAudioInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <FileAudio className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drop MP3 file here or click to upload</p>
              <p className="text-xs text-muted-foreground">MP3 files only</p>
            </div>
          </div>
        </Card>

        {/* PDF Upload */}
        <Card
          {...getPdfRootProps()}
          className="p-6 border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getPdfInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <FilePdf className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drop PDF file here or click to upload</p>
              <p className="text-xs text-muted-foreground">PDF files only</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transcription Result */}
      {(isTranscribing || transcript) && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Transcription</h3>
          {isTranscribing ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Transcribing audio...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="min-h-[180px] resize-none"
                  placeholder="Transcribed text will appear here..."
                />
              </ScrollArea>
              
              {transcript && (
                <div className="space-y-2">
                  <h4 className="font-medium">Timestamped Words</h4>
                  <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                    <div className="space-y-1">
                      {transcript.words.map((word, index) => (
                        <span
                          key={index}
                          className="inline-block bg-muted rounded px-1 py-0.5 text-xs mr-1 mb-1"
                          title={`${word.start.toFixed(2)}s - ${word.end.toFixed(2)}s`}
                        >
                          {word.word}
                        </span>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Validation Controls */}
      {transcript && pdfText && (
        <div className="flex justify-end">
          <Button
            onClick={handleValidate}
            disabled={isValidating}
            className="gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Validate with Claude
              </>
            )}
          </Button>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && (
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Validation Results</h3>
          
          <div className="space-y-2">
            <h4 className="font-medium">Feedback</h4>
            <p className="text-sm text-muted-foreground">{validationResult.feedback}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Suggested Edits</h4>
            <ReactDiffViewer
              oldValue={transcript?.text || ''}
              newValue={validationResult.suggestedEdits}
              splitView={true}
              useDarkTheme={true}
              leftTitle="Original Transcript"
              rightTitle="Suggested Edits"
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Generated Thumbnail Prompts</h4>
            <div className="space-y-1">
              {validationResult.thumbnailPrompts.map((prompt, index) => (
                <div key={index} className="p-2 bg-muted rounded-md text-sm">
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}