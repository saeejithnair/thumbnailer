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
    
    // Simulate API delay with random timing for more realistic batch generation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Return a random mock image URL
    return mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)];

    /* Real API implementation (currently blocked by CORS)
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        model: 'grok-vision-beta',
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Unknown API error');
    }

    if (!data.data?.[0]?.url) {
      throw new Error('No image URL in response');
    }

    return data.data[0].url;
    */
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
    throw new Error('Image generation failed: Unknown error');
  }
}