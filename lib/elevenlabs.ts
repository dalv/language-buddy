const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Example Chinese voice ID

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to synthesize speech');
  }

  return await response.arrayBuffer();
}

