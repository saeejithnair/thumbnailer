import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { toast } from 'sonner';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY;

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    // For demo purposes, return a mock image URL since the API has CORS restrictions
    const mockImageUrls = [
      'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501862700950-18382cd41497?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    ];
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    return mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
    throw new Error('Image generation failed: Unknown error');
  }
}

export async function transcribeAudio(audioFile: File): Promise<{
  text: string;
  words: Array<{ word: string; start: number; end: number; }>;
  formattedText: string;
}> {
  try {
    // Validate file size (Whisper limit is 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      throw new Error('Audio file must be less than 25MB');
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(audioFile.type)) {
      throw new Error('Unsupported audio format. Please use MP3, WAV, M4A, OGG, or WebM');
    }

    const toastId = toast.loading('Preparing audio file...');
    
    toast.loading('Uploading to OpenAI...', { id: toastId });
    
    let transcription;
    try {
      transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new Error('OpenAI rate limit reached. Please try again in a minute.');
      }
      throw error;
    }

    toast.loading('Processing transcription...', { id: toastId });
    
    const words = transcription.words || [];
    if (words.length === 0) {
      throw new Error('No speech detected in audio file');
    }

    let formattedChunks: string[] = [];
    
    // Process intro section
    const introText = words.map(w => w.word).join(' ');
    if (introText.toLowerCase().includes('google illuminate')) {
      // Find the exact positions of our three intro sentences
      const firstSentenceWords = words.slice(0, words.findIndex(w => 
        w.word.toLowerCase().includes('check out') || 
        w.word.toLowerCase().includes('checkout')) || 10);
      
      const secondSentenceStart = words.findIndex(w => 
        w.word.toLowerCase().includes('check out') || 
        w.word.toLowerCase().includes('checkout'));
      const secondSentenceWords = words.slice(secondSentenceStart, 
        words.findIndex((w, i) => i > secondSentenceStart && 
          w.word.toLowerCase().includes('welcome')) || secondSentenceStart + 10);
      
      const thirdSentenceStart = words.findIndex(w => 
        w.word.toLowerCase().includes('welcome'));
      const thirdSentenceWords = words.slice(thirdSentenceStart, 
        words.findIndex((w, i) => i > thirdSentenceStart && 
          w.word.toLowerCase().includes('discussion')) + 1 || thirdSentenceStart + 5);

      // Format the three intro sentences
      if (firstSentenceWords.length > 0) {
        formattedChunks.push(
          `[${formatTimestamp(firstSentenceWords[0].start)}]This conversation is powered by Google Illuminate`
        );
      }
      
      if (secondSentenceWords.length > 0) {
        formattedChunks.push(
          `[${formatTimestamp(secondSentenceWords[0].start)}]Check out illuminate.google.com for more`
        );
      }
      
      if (thirdSentenceWords.length > 0) {
        formattedChunks.push(
          `[${formatTimestamp(thirdSentenceWords[0].start)}]Welcome to the discussion`
        );
      }

      // Process the rest of the transcript starting after the intro
      const introEndIndex = thirdSentenceWords.length > 0 ? 
        words.indexOf(thirdSentenceWords[thirdSentenceWords.length - 1]) + 1 : 0;
      
      // Process remaining content in ~7s chunks
      let currentChunk: typeof words = [];
      let chunkStartTime = words[introEndIndex]?.start || 0;
      
      for (let i = introEndIndex; i < words.length; i++) {
        const word = words[i];
        currentChunk.push(word);
        
        if (word.end - chunkStartTime >= 7 || i === words.length - 1) {
          if (currentChunk.length > 0) {
            const timestamp = formatTimestamp(chunkStartTime);
            const text = currentChunk.map(w => w.word).join(' ').trim();
            if (text) {
              formattedChunks.push(`[${timestamp}]${text}`);
            }
          }
          
          currentChunk = [];
          chunkStartTime = word.end;
        }
      }
    } else {
      // Fallback to normal processing if intro not found
      // Process the rest of the transcript in ~7s chunks
      let currentChunk: typeof words = [];
      let chunkStartTime = 0;
      
      words.forEach((word, i) => {
        if (typeof word.start !== 'number' || typeof word.end !== 'number' || 
            word.end < word.start || word.start < 0) {
          console.warn('Invalid word timing:', word);
          return;
        }
        
        currentChunk.push(word);
        if (word.end - chunkStartTime >= 7 || i === words.length - 1) {
          if (currentChunk.length > 0) {
            const timestamp = formatTimestamp(chunkStartTime);
            const text = currentChunk.map(w => w.word).join(' ').trim();
            if (text) {
              formattedChunks.push(`[${timestamp}]${text}`);
            }
          }
          
          currentChunk = [];
          chunkStartTime = word.end;
        }
      });
    }

    // Ensure we have some output
    if (formattedChunks.length === 0) {
      throw new Error('Failed to format transcript');
    }

    const formattedText = formattedChunks.join('\n');
    
    toast.success('Transcription complete!', { id: toastId });
    return {
      text: transcription.text,
      words: words,
      formattedText
    };
  } catch (error) {
    console.error('Transcription error:', error);
    toast.error('Transcription failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error instanceof Error ? error : new Error('Failed to transcribe audio');
  }
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

// Helper function for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  return matrix[b.length][a.length];
}

export async function validateTranscriptWithClaude(
  transcript: string,
  pdfText: string
): Promise<{
  feedback: string;
  suggestedEdits: string;
  thumbnailPrompts: string[];
}> {
  try {
    // For demo purposes, return mock data
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    return {
      feedback: "The transcript appears to be accurate with minor discrepancies in punctuation and formatting.",
      suggestedEdits: "This is the suggested edited version of the transcript with improved formatting and corrections.",
      thumbnailPrompts: [
        "A serene mountain landscape at sunset with golden light filtering through clouds",
        "A futuristic cityscape with flying vehicles and holographic advertisements",
        "An ancient library filled with floating books and magical artifacts",
        "A underwater scene showing bioluminescent creatures in the deep ocean",
        "A mystical forest with glowing trees and ethereal beings"
      ]
    };

    /* Real implementation (uncomment and add your API key)
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `I have a transcript and its corresponding PDF document. Please:
1. Compare the transcript with the PDF content and provide feedback on accuracy
2. Suggest any necessary edits to improve accuracy
3. Generate 5 creative prompts for AI image generation that capture key themes or moments from the content

Transcript:
${transcript}

PDF Content:
${pdfText}

Please format your response as JSON with the following structure:
{
  "feedback": "Your analysis of the transcript's accuracy",
  "suggestedEdits": "Your suggested corrections",
  "thumbnailPrompts": ["prompt1", "prompt2", "prompt3", "prompt4", "prompt5"]
}`
      }]
    });

    const response = JSON.parse(message.content[0].text);
    return {
      feedback: response.feedback,
      suggestedEdits: response.suggestedEdits,
      thumbnailPrompts: response.thumbnailPrompts
    };
    */
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to validate transcript with Claude');
  }
}