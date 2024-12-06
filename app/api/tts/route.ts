import { NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
const VOICE_ID = 'ByhETIclHirOlWnWKhHc'

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to synthesize speech')
    }

    const audioData = await response.arrayBuffer()
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return new NextResponse('Error synthesizing speech', { status: 500 })
  }
}

