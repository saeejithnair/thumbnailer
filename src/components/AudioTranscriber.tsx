import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, FileAudio, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { transcribeAudio } from '@/lib/api';
import { TranscriptWord } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { AudioPlayer } from './AudioPlayer';

interface AudioTranscriberProps {
  onTranscriptionComplete: (text: string, words: TranscriptWord[], audioFile: File) => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export function AudioTranscriber({ onTranscriptionComplete, onTimeUpdate }: AudioTranscriberProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transcriptData, setTranscriptData] = useState<{
    text: string;
    words: TranscriptWord[];
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.includes('audio')) {
      toast.error('Please upload an audio file');
      return;
    }

    setIsTranscribing(true);
    setUploadedFile(file);

    try {
      const { text, words, formattedText } = await transcribeAudio(file);
      setTranscriptData({ text: formattedText, words });
      onTranscriptionComplete(formattedText, words, file);
      toast.success('Transcription complete!');
    } catch (error) {
      toast.error('Failed to transcribe audio');
      console.error(error);
      setUploadedFile(null);
    } finally {
      setIsTranscribing(false);
    }
  }, [onTranscriptionComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    },
    maxFiles: 1,
    disabled: isTranscribing
  });

  return (
    <Card className="p-6">
      {uploadedFile && transcriptData ? (
        <AudioPlayer 
          audioFile={uploadedFile}
          words={transcriptData.words}
          onTimeUpdate={onTimeUpdate}
        />
      ) : (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            {isTranscribing ? (
              <>
                <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                <p>Transcribing audio...</p>
              </>
            ) : (
              <>
                <FileAudio className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop the audio file here' : 'Drag & drop an audio file'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to select a file
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports MP3, WAV, M4A, and OGG
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}