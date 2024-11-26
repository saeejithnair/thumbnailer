import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';
import { TranscriptWord } from '@/lib/types';

interface AudioPlayerProps {
  audioFile: File;
  words: TranscriptWord[];
  onTimeUpdate?: (currentTime: number) => void;
}

export function AudioPlayer({ audioFile, words, onTimeUpdate }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const url = URL.createObjectURL(audioFile);
    audioRef.current.src = url;
    
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    onTimeUpdate?.(newTime);
  };

  const handleReset = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    onTimeUpdate?.(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="text-sm text-muted-foreground">
          {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
        </div>
      </div>

      <Slider
        value={[currentTime]}
        max={duration}
        step={0.1}
        onValueChange={handleSliderChange}
        className="w-full"
      />
    </div>
  );
} 