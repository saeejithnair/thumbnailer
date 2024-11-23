import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Check, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PromptQueueProps {
  prompts: string[];
  currentPrompt: number;
  onPromptClick: (prompt: string, batchSize: number) => void;
  onPromptEdit: (index: number, newPrompt: string) => void;
  onPromptDelete: (index: number) => void;
  onPromptAdd: (prompt: string) => void;
  isGenerating: boolean;
}

export function PromptQueue({ 
  prompts, 
  currentPrompt, 
  onPromptClick, 
  onPromptEdit,
  onPromptDelete,
  onPromptAdd,
  isGenerating 
}: PromptQueueProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [selectedBatchSizes, setSelectedBatchSizes] = useState<Record<number, number>>(
    Object.fromEntries(prompts.map((_, i) => [i, 4]))
  );

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditPrompt(prompts[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (editPrompt.trim()) {
      onPromptEdit(index, editPrompt.trim());
    }
    setEditingIndex(null);
    setEditPrompt('');
  };

  const handleAddNew = () => {
    if (newPrompt.trim()) {
      onPromptAdd(newPrompt.trim());
      setNewPrompt('');
      setIsAddingNew(false);
    }
  };

  const handleBatchSizeChange = (index: number, size: string) => {
    const batchSize = parseInt(size, 10);
    setSelectedBatchSizes(prev => ({ ...prev, [index]: batchSize }));
  };

  return (
    <div className="w-64 bg-card/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Prompt Queue</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {isAddingNew && (
            <div className="p-3 rounded-md text-sm bg-card border border-purple-500/50">
              <div className="space-y-2">
                <Textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="min-h-[100px] text-sm"
                  placeholder="Enter new prompt..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleAddNew}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Add Prompt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewPrompt('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {prompts.map((prompt, index) => (
            <div
              key={index}
              className={`p-3 rounded-md text-sm ${
                index === currentPrompt
                  ? "bg-purple-500/20 border border-purple-500/50"
                  : "bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {index + 1}/{prompts.length}
                </Badge>
                {index === currentPrompt && (
                  <Badge className="bg-purple-500">Active</Badge>
                )}
                {!editingIndex && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleStartEdit(index)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onPromptDelete(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="min-h-[100px] text-sm"
                    placeholder="Enter your prompt..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSaveEdit(index)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingIndex(null);
                        setEditPrompt('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2">{prompt}</p>
                  <div className="space-y-2">
                    <Select 
                      value={selectedBatchSizes[index]?.toString() || "4"}
                      onValueChange={(value) => handleBatchSizeChange(index, value)}
                      disabled={isGenerating}
                    >
                      <SelectTrigger className="w-full mb-2">
                        <SelectValue placeholder="Batch size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 image</SelectItem>
                        <SelectItem value="2">2 images</SelectItem>
                        <SelectItem value="4">4 images</SelectItem>
                        <SelectItem value="8">8 images</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onPromptClick(prompt, selectedBatchSizes[index] || 4)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating {selectedBatchSizes[index] || 4} Images
                        </>
                      ) : (
                        'Generate Images'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}