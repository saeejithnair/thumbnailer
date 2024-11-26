import { Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Sparkles className="w-8 h-8 text-purple-500" />
        <h1 className="text-3xl font-bold">AI Illuminated Pipeline</h1>
      </div>
      <ThemeToggle />
    </div>
  );
}