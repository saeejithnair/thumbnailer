import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PromptQueue } from '@/components/PromptQueue';
import { ImageGrid } from '@/components/ImageGrid';
import { SessionManager } from '@/components/SessionManager';
import { mockPrompts } from '@/lib/mockData';
import { generateImage } from '@/lib/api';
import { generateReadableId } from '@/lib/nameGenerator';
import { toast } from 'sonner';
import { GeneratedImage, Session } from '@/lib/types';

function App() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const initialSession = {
      id: generateReadableId(),
      name: 'New Session',
      timestamp: Date.now(),
      promptQueue: [...mockPrompts], // Create a new array to avoid mutations
      currentPrompt: 0
    };
    return [initialSession];
  });
  
  const [currentSession, setCurrentSession] = useState<Session>(sessions[0]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [currentBatchSize, setCurrentBatchSize] = useState(4);

  // Update currentSession when sessions change
  useEffect(() => {
    const updatedSession = sessions.find(s => s.id === currentSession.id);
    if (updatedSession) {
      setCurrentSession(updatedSession);
    }
  }, [sessions]);

  const handlePromptClick = async (prompt: string, batchSize: number = 4) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setCurrentBatchSize(batchSize);
    toast.loading(`Generating ${batchSize} images...`);

    try {
      const batchPromises = Array(batchSize).fill(null).map(() => generateImage(prompt));
      const imageUrls = await Promise.all(batchPromises);
      
      const batchId = generateReadableId();
      const newImages = imageUrls.map((url, index) => ({
        id: `${batchId}-${index + 1}`,
        url,
        prompt,
        parentId: null,
        batchId,
        sessionId: currentSession.id,
        timestamp: Date.now()
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
      toast.success(`Generated ${batchSize} images successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate images');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariations = async (imageId: string) => {
    const originalImage = generatedImages.find(img => img.id === imageId);
    if (!originalImage || isGenerating) return;

    setIsGenerating(true);
    setCurrentBatchSize(4);
    toast.loading('Generating variations...');

    try {
      const batchPromises = Array(4).fill(null).map(() => 
        generateImage(`Create a variation of: ${originalImage.prompt}`)
      );
      const imageUrls = await Promise.all(batchPromises);
      
      const batchId = generateReadableId();
      const newImages = imageUrls.map((url, index) => ({
        id: `${batchId}-${index + 1}`,
        url,
        prompt: `Variation of: ${originalImage.prompt}`,
        parentId: originalImage.id,
        batchId,
        sessionId: currentSession.id,
        timestamp: Date.now()
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
      toast.success('Variations generated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImages = (imageIds: string[]) => {
    setGeneratedImages(prev => prev.filter(img => !imageIds.includes(img.id)));
    toast.success(`Deleted ${imageIds.length} images`);
  };

  const handleCreateSession = () => {
    const newSession: Session = {
      id: generateReadableId(),
      name: `Session ${sessions.length + 1}`,
      timestamp: Date.now(),
      promptQueue: [...mockPrompts], // Create a new array to avoid mutations
      currentPrompt: 0
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return;
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession.id === sessionId) {
      setCurrentSession(sessions[0]);
    }
    setGeneratedImages(prev => prev.filter(img => img.sessionId !== sessionId));
  };

  const handleSessionRename = (sessionId: string, newName: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, name: newName } : session
    ));
  };

  const handlePromptEdit = (index: number, newPrompt: string) => {
    setSessions(prev => prev.map(session => 
      session.id === currentSession.id 
        ? {
            ...session,
            promptQueue: session.promptQueue.map((p, i) => 
              i === index ? newPrompt : p
            )
          }
        : session
    ));
  };

  const handlePromptDelete = (index: number) => {
    setSessions(prev => prev.map(session =>
      session.id === currentSession.id
        ? {
            ...session,
            promptQueue: session.promptQueue.filter((_, i) => i !== index),
            currentPrompt: Math.min(session.currentPrompt, session.promptQueue.length - 2)
          }
        : session
    ));
  };

  const handlePromptAdd = (prompt: string) => {
    setSessions(prev => prev.map(session =>
      session.id === currentSession.id
        ? {
            ...session,
            promptQueue: [...session.promptQueue, prompt]
          }
        : session
    ));
  };

  const currentSessionImages = generatedImages.filter(
    img => img.sessionId === currentSession.id
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        
        <div className="flex gap-6">
          <div className="space-y-4">
            <SessionManager
              sessions={sessions}
              currentSession={currentSession}
              onSessionSelect={setCurrentSession}
              onSessionCreate={handleCreateSession}
              onSessionDelete={handleDeleteSession}
              onSessionRename={handleSessionRename}
            />
            
            <PromptQueue 
              prompts={currentSession.promptQueue}
              currentPrompt={currentSession.currentPrompt}
              onPromptClick={handlePromptClick}
              onPromptEdit={handlePromptEdit}
              onPromptDelete={handlePromptDelete}
              onPromptAdd={handlePromptAdd}
              isGenerating={isGenerating}
            />
          </div>
          
          <div className="flex-1">
            <ImageGrid 
              images={currentSessionImages}
              onGenerateVariations={handleGenerateVariations}
              onDeleteImages={handleDeleteImages}
              isGenerating={isGenerating}
              highlightedId={highlightedId}
              onHighlight={setHighlightedId}
              batchSize={currentBatchSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;