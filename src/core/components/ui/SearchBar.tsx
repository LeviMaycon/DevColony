'use client'

import { useState, useEffect, useRef } from 'react'
import { useWorldStore } from '../../simulation/World'
import { generatePositions } from '../../simulation/placement'
import { useGitHubSearch } from '../../hooks/useGitHubSearch'
import { useShareSearch } from '../../hooks/useShareSearch'
import { useSearchHistory } from '../../hooks/useSearchHistory'

export default function SearchBar() {
    const [query, setQuery]           = useState('')
    const [yearFilter, setYearFilter] = useState<string>('')
    const [showHistory, setShowHistory] = useState(false)
    const [copied, setCopied]         = useState(false)
    const { search, loading, error }  = useGitHubSearch()
    const { addFood, clearFoods, foods } = useWorldStore()
    const { history, addToHistory, removeFromHistory } = useSearchHistory()
    const { share, getQueryFromUrl }  = useShareSearch()
    const inputRef = useRef<HTMLInputElement>(null)

    // Lê query da URL ao montar
    useEffect(() => {
        const q = getQueryFromUrl()
        if (q) {
            setQuery(q)
            handleSearch(q)
        }
    }, [])

    async function handleSearch(q?: string) {
        const term = (q ?? query).trim()
        if (!term) return

        clearFoods()
        addToHistory(term)
        setShowHistory(false)

        const W = window.innerWidth
        const H = window.innerHeight

        const url = yearFilter
            ? `/api/github/search?q=${encodeURIComponent(term)}&year=${yearFilter}`
            : `/api/github/search?q=${encodeURIComponent(term)}`

        const res  = await fetch(url)
        const data = await res.json()
        const repos = data.repos ?? []
        const positions = generatePositions(repos.length, W, H)

        repos.forEach((repo: any, i: number) => {
            addFood({
                id: repo.id,
                position: positions[i],
                value: Math.min(10 + Math.log2(repo.repoStars + 1) * 4, 30),
                discovered: false,
                repoName: repo.repoName,
                repoUrl: repo.repoUrl,
                repoStars: repo.repoStars,
                repoLanguage: repo.repoLanguage,
                repoOwner: repo.repoOwner,
                repoOwnerAvatar: repo.repoOwnerAvatar,
                repoCreatedAt: repo.repoCreatedAt,
                description: repo.description,
            })
        })

        // Atualiza URL sem recarregar
        const url2 = new URL(window.location.href)
        url2.searchParams.set('q', term)
        window.history.replaceState({}, '', url2.toString())
    }

    async function handleTrending() {
        clearFoods()
        setQuery('trending')
        setShowHistory(false)

        const W = window.innerWidth
        const H = window.innerHeight

        const res  = await fetch('/api/github/trending')
        const data = await res.json()
        const repos = data.repos ?? []
        const positions = generatePositions(repos.length, W, H)

        repos.forEach((repo: any, i: number) => {
            addFood({
                id: repo.id,
                position: positions[i],
                value: Math.min(10 + Math.log2(repo.repoStars + 1) * 4, 30),
                discovered: false,
                repoName: repo.repoName,
                repoUrl: repo.repoUrl,
                repoStars: repo.repoStars,
                repoLanguage: repo.repoLanguage,
                repoOwner: repo.repoOwner,
                repoOwnerAvatar: repo.repoOwnerAvatar,
                repoCreatedAt: repo.repoCreatedAt,
                description: repo.description,
            })
        })
    }

    function handleShare() {
        share(query)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 15 }, (_, i) => String(currentYear - i))

    return (
        <div className="flex flex-col gap-2 w-full font-mono">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        onFocus={() => setShowHistory(true)}
                        onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                        placeholder="ex: fire simulation python"
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[12px] text-[#c9d1d9] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30 transition-colors"
                    />

                    {/* Histórico dropdown */}
                    {showHistory && history.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden z-50">
                            {history.map((q) => (
                                <div
                                    key={q}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-[#21262d] cursor-pointer group"
                                    onMouseDown={() => {
                                        setQuery(q)
                                        handleSearch(q)
                                    }}
                                >
                                    <span className="text-[11px] text-[#8b949e]">{q}</span>
                                    <button
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            removeFromHistory(q)
                                        }}
                                        className="text-[10px] text-[#484f58] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filtro por ano */}
                <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-2 text-[11px] text-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
                >
                    <option value="">Ano</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <button
                    onClick={() => handleSearch()}
                    disabled={loading || !query.trim()}
                    className="px-4 py-2 rounded-md text-[12px] font-medium transition-all bg-[#238636] hover:bg-[#2ea043] border border-[#2ea043] text-[#f0f6fc] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? <span className="text-[#3fb950]">···</span> : 'Buscar'}
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleTrending}
                    disabled={loading}
                    className="cursor-pointer text-[13px] text-[#484f58] hover:text-[#8b949e] hover:underline transition-colors flex items-center gap-1 disabled:opacity-40"
                >
                    ~trending
                </button>

                <span className="text-[#30363d] text-[10px]">·</span>

                {query && (
                    <button
                        onClick={handleShare}
                        className="cursor-pointer text-[13px] text-[#484f58] hover:text-[#8b949e] hover:underline transition-colors flex items-center gap-1"
                    >
                        {copied ? '✓ copiado' : '~compartilhar'}
                    </button>
                )}

                {foods.length > 0 && (
                    <>
                        <span className="text-[#30363d] text-[10px]">·</span>
                        <span className="text-[10px] text-[#484f58] tabular-nums">
                            {foods.length} repos no campo
                        </span>
                    </>
                )}
            </div>

            {error && <p className="text-[10px] text-[#f85149]">{error}</p>}
        </div>
    )
}