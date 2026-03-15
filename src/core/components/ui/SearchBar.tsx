'use client'

import { useState } from 'react'
import { useGitHubSearch } from '../../hooks/useGitHubSearch'
import { useWorldStore } from '../../simulation/World'

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const { search, loading, error } = useGitHubSearch()
    const { addFood, foods } = useWorldStore()

    async function handleSearch() {
        if (!query.trim()) return
        useWorldStore.getState().clearFoods()
        const newFoods = await search(query)
        newFoods.forEach((food) => addFood(food))
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch()
    }

    return (
        <div className="flex flex-col gap-1.5 w-full font-mono">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="buscar repositórios..."
                    className="
                        flex-1 bg-[#0d1117] border border-[#30363d] rounded-md
                        px-3 py-2 text-[12px] text-[#c9d1d9] placeholder:text-[#484f58]
                        focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30
                        transition-colors
                    "
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="
                        px-4 py-2 rounded-md text-[12px] font-medium transition-all
                        bg-[#238636] hover:bg-[#2ea043] border border-[#2ea043] text-[#f0f6fc]
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#238636]
                    "
                >
                    {loading ? (
                        <span className="text-[#3fb950]">···</span>
                    ) : (
                        'Buscar'
                    )}
                </button>
            </div>

            {error && (
                <p className="text-[10px] text-[#f85149] tracking-wide">{error}</p>
            )}

            {foods.length > 0 && !error && (
                <p className="text-[10px] text-[#484f58] tabular-nums">
                    {foods.length} repositórios no campo
                </p>
            )}
        </div>
    )
}