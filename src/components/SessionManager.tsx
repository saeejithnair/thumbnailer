import { useState } from 'react';
import { Session } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Clock, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';

interface SessionManagerProps {
  sessions: Session[];
  currentSession: Session;
  onSessionSelect: (session: Session) => void;
  onSessionCreate: () => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newName: string) => void;
}

export function SessionManager({
  sessions,
  currentSession,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onSessionRename,
}: SessionManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (session: Session) => {
    setEditingId(session.id);
    setEditName(session.name);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editName.trim()) {
      onSessionRename(sessionId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-64 bg-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Sessions</h2>
        <Button variant="ghost" size="icon" onClick={onSessionCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className={`p-3 transition-colors ${
                session.id === currentSession.id
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1" onClick={() => !editingId && onSessionSelect(session)}>
                  {editingId === session.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(session.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSaveEdit(session.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-sm cursor-pointer">{session.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(session.timestamp, { addSuffix: true })}
                      </div>
                    </>
                  )}
                </div>
                {!editingId && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(session);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {sessions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionDelete(session.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}