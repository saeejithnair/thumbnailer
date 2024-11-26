import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { TranscriptWord } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TranscriptEditorProps {
  transcript: string;
  words: TranscriptWord[];
  editedTranscript?: string;
  onTranscriptEdit: (newText: string) => void;
  validation?: {
    feedback: string;
    suggestedEdits: string;
  };
  currentTime?: number;
}

export function TranscriptEditor({
  transcript,
  words,
  editedTranscript,
  onTranscriptEdit,
  validation,
  currentTime = 0
}: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState(editedTranscript || transcript);

  useEffect(() => {
    setEditableText(editedTranscript || transcript);
  }, [editedTranscript, transcript]);

  const handleSave = () => {
    onTranscriptEdit(editableText);
    setIsEditing(false);
  };

  const renderTranscriptLine = (line: string, index: number) => {
    const timestampMatch = line.match(/^\[(\d{2}:\d{2}\.\d{2})\]/);
    if (!timestampMatch) return <div key={index}>{line}</div>;

    const timestamp = parseTimestamp(timestampMatch[1]);
    const text = line.slice(timestampMatch[0].length);
    
    // Highlight the line if current time falls within its 7-second window
    const isActive = currentTime >= timestamp && currentTime < timestamp + 7;

    return (
      <div 
        key={index} 
        className={cn(
          "flex gap-2",
          isActive && "bg-purple-500/20 rounded"
        )}
      >
        <span className="text-muted-foreground whitespace-nowrap">
          {timestampMatch[1]}
        </span>
        <span>{text}</span>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transcript</h3>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 font-mono text-sm">
              {transcript.split('\n').map((line, index) => renderTranscriptLine(line, index))}
            </div>
          </ScrollArea>
        )}

        {validation && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Validation Feedback</h4>
            <p className="text-sm text-muted-foreground">{validation.feedback}</p>
            {validation.suggestedEdits && (
              <>
                <h4 className="font-medium">Suggested Edits</h4>
                <p className="text-sm text-muted-foreground">{validation.suggestedEdits}</p>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function parseTimestamp(timestamp: string): number {
  const [minutes, seconds] = timestamp.split(':');
  const [secs, ms] = seconds.split('.');
  return parseInt(minutes) * 60 + parseInt(secs) + parseInt(ms) / 100;
}