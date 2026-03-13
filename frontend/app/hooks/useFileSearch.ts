import { useState, useMemo } from 'react'
import type { ItemI } from '~/types/types'
import Fuse from 'fuse.js'

const SYNONYMS: Record<string, string> = {
    'тз': 'техническое задание',
    'тд': 'техническая документация',
    'пр': 'проект',
    'бюджет': 'финансы смета',
    'скрин': 'скриншот',
}

export const useFileSearch = (initialItems: ItemI[] | null) => {
    const [searchQuery, setSearchQuery] = useState('')

    const expandQuery = (query: string): string => {
        const words = query.toLowerCase().split(/\s+/)
        const expandedWords = words.map(word => {
            const synonym = SYNONYMS[word]
            return synonym ? `${word} ${synonym}` : word
        })
        return expandedWords.join(' ')
    }

    const getAllFilesRecursive = (items: ItemI[]): ItemI[] => {
        let files: ItemI[] = []
        items.forEach(item => {
            if (item.type === 'file') {
                files.push(item)
            } else if (item.type === 'folder' && item.children) {
                files = [...files, ...getAllFilesRecursive(item.children)]
            }
        })
        return files
    }

    const result = useMemo(() => {
        if (!initialItems) return { items: [], bestMatchId: null }
        if (!searchQuery.trim()) return { items: initialItems, bestMatchId: null }

        const allFiles = getAllFilesRecursive(initialItems)
        const expandedQuery = expandQuery(searchQuery)

        const fuse = new Fuse(allFiles, {
            keys: ['title'],
            threshold: 0.4,
            location: 0,
            distance: 100,
            minMatchCharLength: 1,
            includeScore: true,
        })

        const searchResult = fuse.search(expandedQuery)
        const items = searchResult.map(r => r.item)
        const bestMatchId = searchResult.length > 0 ? searchResult[0].item.id : null

        return { items, bestMatchId }
    }, [initialItems, searchQuery])

    const isSearching = searchQuery.trim().length > 0

    return {
        searchQuery,
        setSearchQuery,
        filteredItems: result.items,
        bestMatchId: result.bestMatchId,
        isSearching
    }
}
