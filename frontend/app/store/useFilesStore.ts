import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import type { ItemI } from '~/types/types'

// Создаем custom storage для IndexedDB на базе idb-keyval, с защитой от SSR
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

interface FilesState {
  filesTree: ItemI[]
  setFilesTree: (filesTree: ItemI[]) => void
  clearFilesTree: () => void
}

export const useFilesStore = create<FilesState>()(
  persist(
    (set) => ({
      filesTree: [],
      setFilesTree: (filesTree) => set({ filesTree }),
      clearFilesTree: () => set({ filesTree: [] }),
    }),
    {
      name: 'files-storage', // уникальное имя для хранилища
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
