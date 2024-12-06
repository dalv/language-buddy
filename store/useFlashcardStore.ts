import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface Flashcard {
  id: string
  front: string
  back: {
    main: string
    secondary: string
  }
  easiness: number
}

interface FlashcardStore {
  flashcards: Flashcard[]
  loading: boolean
  error: string | null
  settings: { [key: string]: string }
  fetchFlashcards: () => Promise<void>
  addFlashcard: (front: string, backMain: string, backSecondary: string) => Promise<void>
  editFlashcard: (id: string, front: string, backMain: string, backSecondary: string) => Promise<void>
  deleteFlashcard: (id: string) => Promise<void>
  updateEasiness: (id: string, easiness: number) => Promise<void>
  fetchSettings: () => Promise<void>
  updateSetting: (name: string, value: string) => Promise<void>
}

export const useFlashcardStore = create<FlashcardStore>((set, get) => ({
  flashcards: [],
  loading: false,
  error: null,
  settings: {},

  fetchFlashcards: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.from('flashcards').select('*')
      if (error) throw error
      set({ flashcards: data as Flashcard[], loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addFlashcard: async (front, backMain, backSecondary) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({ front, back: { main: backMain, secondary: backSecondary }, easiness: 2.5 })
        .select()
      if (error) throw error
      set((state) => ({ flashcards: [...state.flashcards, data[0] as Flashcard], loading: false }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  editFlashcard: async (id, front, backMain, backSecondary) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .update({ front, back: { main: backMain, secondary: backSecondary } })
        .eq('id', id)
        .select()
      if (error) throw error
      set((state) => ({
        flashcards: state.flashcards.map((card) => (card.id === id ? data[0] as Flashcard : card)),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  deleteFlashcard: async (id) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.from('flashcards').delete().eq('id', id)
      if (error) throw error
      set((state) => ({
        flashcards: state.flashcards.filter((card) => card.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateEasiness: async (id, easiness) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .update({ easiness })
        .eq('id', id)
        .select()
      if (error) throw error
      set((state) => ({
        flashcards: state.flashcards.map((card) => (card.id === id ? data[0] as Flashcard : card)),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchSettings: async () => {
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const settings = await response.json()
      set({ settings })
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  },

  updateSetting: async (name, value) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, value }),
      })

      if (!response.ok) {
        throw new Error('Failed to update setting')
      }

      set((state) => ({
        settings: { ...state.settings, [name]: value },
      }))
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  },
}))

