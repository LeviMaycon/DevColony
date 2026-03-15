import { useState, useEffect } from 'react'

const STORAGE_KEY = 'devcolony:search-history'
const MAX_HISTORY = 10

export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([])

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) setHistory(JSON.parse(saved))
        } catch { }
    }, [])

    function addToHistory(query: string) {
        const trimmed = query.trim()
        if (!trimmed) return
        setHistory((prev) => {
            const filtered = prev.filter((q) => q !== trimmed)
            const next = [trimmed, ...filtered].slice(0, MAX_HISTORY)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    function removeFromHistory(query: string) {
        setHistory((prev) => {
            const next = prev.filter((q) => q !== query)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    function clearHistory() {
        localStorage.removeItem(STORAGE_KEY)
        setHistory([])
    }

    return { history, addToHistory, removeFromHistory, clearHistory }
}