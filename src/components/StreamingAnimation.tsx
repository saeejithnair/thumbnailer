import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StreamingAnimationProps {
  count: number;
  className?: string;
}

export function StreamingAnimation({ count, className }: StreamingAnimationProps) {
  const [progress, setProgress] = useState<number[]>(Array(count).fill(0));

  useEffect(() => {
    const intervals = Array(count).fill(0).map((_, index) => {
      return setInterval(() => {
        setProgress(prev => {
          const newProgress = [...prev];
          if (newProgress[index] < 100) {
            newProgress[index] = Math.min(100, newProgress[index] + Math.random() * 15);
          }
          return newProgress;
        });
      }, 200 + Math.random() * 300);
    });

    return () => intervals.forEach(clearInterval);
  }, [count]);

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {Array(count).fill(0).map((_, index) => (
        <Card key={index} className="relative overflow-hidden bg-card h-[300px]">
          {/* Skeleton base */}
          <div className="absolute inset-0 bg-muted/30" />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-purple-500/20 animate-pulse" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Progress bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
            <div 
              className="h-full bg-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress[index]}%` }}
            />
          </div>

          {/* Loading spinner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
            <div className="text-sm text-muted-foreground">
              Generating image {index + 1}/{count}
            </div>
          </div>

          {/* Placeholder shapes */}
          <div className="absolute inset-0 p-6">
            <div className="h-full flex flex-col">
              <div className="w-1/3 h-4 bg-muted-foreground/10 rounded animate-pulse mb-4" />
              <div className="flex-1 bg-muted-foreground/5 rounded-lg animate-pulse" />
              <div className="mt-4 flex gap-2">
                <div className="w-1/4 h-3 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="w-1/3 h-3 bg-muted-foreground/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}