import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import type { ItemI } from '~/types/types'

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await del(name)
  },
}

interface RecentFilesState {
  recentFiles: ItemI[]
  addRecentFile: (file: ItemI) => void
  clearRecentFiles: () => void
}

export const useRecentFilesStore = create<RecentFilesState>()(
  persist(
    (set) => ({
      recentFiles: [],
      addRecentFile: (file) => set((state) => {
        // Удаляем если уже есть в списке, чтобы переместить в начало
        const filtered = state.recentFiles.filter(f => f.id !== file.id)
        // Добавляем в начало и ограничиваем до 20 элементов
        return { recentFiles: [file, ...filtered].slice(0, 20) }
      }),
      clearRecentFiles: () => set({ recentFiles: [] }),
    }),
    {
      name: 'recent-files-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
