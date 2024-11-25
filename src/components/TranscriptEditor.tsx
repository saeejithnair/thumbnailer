import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { TranscriptWord } from '@/lib/types';

interface TranscriptEditorProps {
  transcript: string;
  words: TranscriptWord[];
  editedTranscript?: string;
  onTranscriptEdit: (newText: string) => void;
  validation?: {
    feedback: string;
    suggestedEdits: string;
  };
}

export function TranscriptEditor({
  transcript,
  words,
  editedTranscript,
  onTranscriptEdit,
  validation
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
              className="min-h-[300px]"
            />
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {editedTranscript ? (
              <ReactDiffViewer
                oldValue={transcript}
                newValue={editedTranscript}
                splitView={false}
                useDarkTheme={false}
                showDiffOnly={false}
              />
            ) : (
              <div className="space-y-2">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className="inline-block mr-1"
                    title={`${word.start.toFixed(2)}s - ${word.end.toFixed(2)}s`}
                  >
                    {word.word}
                  </span>
                ))}
              </div>
            )}
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