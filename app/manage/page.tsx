'use client'

import { useState, useEffect } from 'react'
import { useFlashcardStore } from '@/store/useFlashcardStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import { Pencil, Trash } from 'lucide-react'

export default function ManageFlashcards() {
  const { flashcards, loading, error, fetchFlashcards, addFlashcard, editFlashcard, deleteFlashcard, settings, fetchSettings, updateSetting } = useFlashcardStore()
  const [front, setFront] = useState('')
  const [backMain, setBackMain] = useState('')
  const [backSecondary, setBackSecondary] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    fetchFlashcards()
    fetchSettings()
  }, [fetchFlashcards, fetchSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      await editFlashcard(editId, front, backMain, backSecondary)
      setEditId(null)
    } else {
      await addFlashcard(front, backMain, backSecondary)
    }
    setFront('')
    setBackMain('')
    setBackSecondary('')
  }

  const handleEdit = (id: string) => {
    const card = flashcards.find((c) => c.id === id)
    if (card) {
      setFront(card.front)
      setBackMain(card.back.main)
      setBackSecondary(card.back.secondary)
      setEditId(id)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteFlashcard(id)
  }

  const handleAutoPlayToggle = async () => {
    const newValue = settings.autoPlaySound === 'ON' ? 'OFF' : 'ON'
    await updateSetting('autoPlaySound', newValue)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <TooltipProvider>
      <div>
        <div className="flex items-center justify-between mb-4">
          <span>Auto-play sound:</span>
          <Switch
            checked={settings.autoPlaySound === 'ON'}
            onCheckedChange={handleAutoPlayToggle}
          />
        </div>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col space-y-2 mb-2">
            <Input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front of card"
              required
            />
            <Input
              type="text"
              value={backMain}
              onChange={(e) => setBackMain(e.target.value)}
              placeholder="Back of card (Main)"
              required
            />
            <Input
              type="text"
              value={backSecondary}
              onChange={(e) => setBackSecondary(e.target.value)}
              placeholder="Back of card (Secondary)"
              required
            />
          </div>
          <Button type="submit">{editId ? 'Update' : 'Add'} Flashcard</Button>
        </form>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {flashcards.map((card) => (
            <Card key={card.id} className="max-w-[250px]">
              <CardContent className="p-4 relative">
                <div className="mb-8">
                  <p className="font-semibold mb-2">{card.front}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm mb-1 cursor-help">{card.back.main}</p>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-10 max-w-2xl">
                      <p className="text-6xl font-extrabold leading-tight">{card.back.main}</p>
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-xs text-gray-600">{card.back.secondary}</p>
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <Button variant="outline" onClick={() => handleEdit(card.id)} className="p-1 h-8 w-8">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(card.id)} className="p-1 h-8 w-8">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </TooltipProvider>
  )
}

