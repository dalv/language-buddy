'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useFlashcardStore } from '@/store/useFlashcardStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import { Volume2, Loader2 } from 'lucide-react'

export default function StudyFlashcards() {
  const { flashcards, loading, error, fetchFlashcards, updateEasiness, settings, fetchSettings } = useFlashcardStore()
  const [currentCard, setCurrentCard] = useState<number | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchFlashcards()
    fetchSettings()
  }, [fetchFlashcards, fetchSettings])

  const getRandomCardIndex = useCallback(() => {
    const totalWeight = flashcards.reduce((sum, card) => sum + (1 / card.easiness), 0)
    let randomWeight = Math.random() * totalWeight
    let chosenIndex = 0

    for (let i = 0; i < flashcards.length; i++) {
      randomWeight -= 1 / flashcards[i].easiness
      if (randomWeight <= 0) {
        chosenIndex = i
        break
      }
    }

    return chosenIndex
  }, [flashcards])

  useEffect(() => {
    if (flashcards.length > 0) {
      setCurrentCard(getRandomCardIndex())
    }
  }, [flashcards, getRandomCardIndex])

  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to synthesize speech')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        await audioRef.current.play()
      }
    } catch (error) {
      console.error('Failed to synthesize speech:', error)
    } finally {
      setIsSpeaking(false)
    }
  }, [isSpeaking])

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      if (!prev && currentCard !== null && settings.autoPlaySound === 'ON') {
        speakText(flashcards[currentCard].back.main)
      }
      return !prev
    })
  }, [currentCard, flashcards, speakText, settings.autoPlaySound])

  const handleDifficulty = useCallback(async (difficulty: number) => {
    if (currentCard !== null) {
      const card = flashcards[currentCard]
      const newEasiness = Math.max(1.3, card.easiness + (0.1 - (4 - difficulty) * (0.08 + (4 - difficulty) * 0.02)))
      await updateEasiness(card.id, newEasiness)
      setCurrentCard(getRandomCardIndex())
      setIsFlipped(false)
    }
  }, [currentCard, flashcards, updateEasiness, getRandomCardIndex])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (isFlipped && currentCard !== null) {
          // If already flipped, just play audio
          speakText(flashcards[currentCard].back.main);
        } else {
          // If not flipped, flip the card and play audio if autoPlaySound is ON
          setIsFlipped(true);
          if (currentCard !== null && settings.autoPlaySound === 'ON') {
            speakText(flashcards[currentCard].back.main);
          }
        }
      } else if (isFlipped && event.key >= '1' && event.key <= '4') {
        handleDifficulty(parseInt(event.key));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFlipped, currentCard, flashcards, speakText, handleDifficulty, settings.autoPlaySound]);

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  if (flashcards.length === 0) {
    return (
      <div className="text-center">
        <p className="mb-4">No flashcards available. Please add some flashcards first.</p>
        <Link href="/manage">
          <Button>Manage Flashcards</Button>
        </Link>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center">
        {/* Removed line: <h2 className="text-2xl font-semibold mb-4">Study Flashcards</h2> */}
        {currentCard !== null && (
          <Card className="w-full max-w-md mb-4 cursor-pointer" onClick={handleFlip}>
            <CardContent className="p-6 text-center min-h-[200px] flex flex-col items-center justify-center relative">
              {isFlipped ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xl mb-2 cursor-help">{flashcards[currentCard].back.main}</p>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-10 max-w-3xl">
                      <p className="text-7xl font-extrabold leading-tight">{flashcards[currentCard].back.main}</p>
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-sm text-gray-600">{flashcards[currentCard].back.secondary}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakText(flashcards[currentCard].back.main)
                    }}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Read aloud</span>
                  </Button>
                </>
              ) : (
                <p className="text-xl">{flashcards[currentCard].front}</p>
              )}
            </CardContent>
          </Card>
        )}
        {isFlipped && (
          <div className="mb-4">
            <div className="flex justify-center space-x-2">
              <Button onClick={() => handleDifficulty(1)}>Hard (1)</Button>
              <Button onClick={() => handleDifficulty(2)}>Difficult (2)</Button>
              <Button onClick={() => handleDifficulty(3)}>OK (3)</Button>
              <Button onClick={() => handleDifficulty(4)}>Easy (4)</Button>
            </div>
          </div>
        )}
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
        <audio ref={audioRef} />
      </div>
    </TooltipProvider>
  )
}

