import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { toast } from 'sonner';

const openai = new OpenAI({
  apiKey: 'your-openai-api-key', // Replace with your API key
  dangerouslyAllowBrowser: true // Enable browser usage
});

const anthropic = new Anthropic({
  apiKey: 'your-anthropic-api-key', // Replace with your API key
  dangerouslyAllowBrowser: true // Enable browser usage
});

const XAI_API_KEY = 'xai-tc5kk9Y514X219WUAzLiEloB5fC3ZCuYCMuB46PBBgeAIMFYTCCuchrnX8cNz8NxgSSwgQbRYH0DHyt3';

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
}> {
  try {
    // For demo purposes, return mock data
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    return {
      text: "This is a mock transcription of the audio file. Replace this with actual OpenAI Whisper API integration in production.",
      words: [
        { word: "This", start: 0, end: 0.5 },
        { word: "is", start: 0.5, end: 0.7 },
        { word: "a", start: 0.7, end: 0.8 },
        { word: "mock", start: 0.8, end: 1.2 },
        { word: "transcription", start: 1.2, end: 2.0 }
      ]
    };

    /* Real implementation (uncomment and add your API key)
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    });

    return {
      text: transcription.text,
      words: transcription.words
    };
    */
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
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