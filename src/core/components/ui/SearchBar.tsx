'use client'

import { useState } from 'react'
import { useGitHubSearch } from '../../hooks/useGitHubSearch'
import { useWorldStore } from '../../simulation/World'
import { AlertCircle, Loader2, Search, TerminalSquare } from 'lucide-react'
import { Alert, AlertDescription } from '@/src/core/components/ui/alert'
import { Badge } from '@/src/core/components/ui/badge'
import { Button } from '@/src/core/components/ui/button'
import { Input } from '@/src/core/components/ui/input'
import { cn } from '@/lib/utils'

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
        <div className="flex flex-col gap-2 w-full font-mono">
            <div className="flex items-center gap-1.5 text-[10px] text-[#484f58] uppercase tracking-widest">
                <TerminalSquare className="w-3 h-3" />
                <span>tópico de busca</span>
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#484f58] pointer-events-none" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ex: fire simulation python"
                        disabled={loading}
                        className={cn(
                            'pl-8 h-9 text-[12px] font-mono',
                            'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]',
                            'placeholder:text-[#3d444d]',
                            'focus-visible:ring-1 focus-visible:ring-[#58a6ff]/40 focus-visible:border-[#58a6ff]',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'transition-colors duration-150',
                        )}
                    />
                </div>

                <Button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    size="sm"
                    className={cn(
                        'h-9 px-4 text-[12px] font-mono font-medium',
                        'bg-[#238636] hover:bg-[#2ea043] active:bg-[#1a7f37]',
                        'border border-[#2ea043] hover:border-[#3fb950]',
                        'text-[#f0f6fc]',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                        'transition-all duration-150',
                    )}
                >
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        'Buscar'
                    )}
                </Button>
            </div>
            {error && (
                <Alert className="py-2 px-3 bg-[#160b0b] border-[#f8514926] rounded-md">
                    <AlertCircle className="w-3 h-3 text-[#f85149]" />
                    <AlertDescription className="text-[11px] text-[#f85149] font-mono ml-1">
                        {error}
                    </AlertDescription>
                </Alert>
            )}
            {foods.length > 0 && !error && (
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                            'text-[10px] font-mono px-2 py-0',
                            'bg-[#0d1117] border-[#30363d] text-[#3fb950]',
                            'rounded-sm tabular-nums',
                        )}
                    >
                        {foods.length} repos
                    </Badge>
                    <span className="text-[10px] text-[#484f58]">no campo</span>
                </div>
            )}
        </div>
    )
}