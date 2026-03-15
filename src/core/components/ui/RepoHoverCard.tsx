'use client'

import { useWorldStore } from '../../simulation/World'
import { useEffect, useState } from 'react'

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'hoje'
    if (days === 1) return 'ontem'
    if (days < 30) return `${days}d atrás`
    if (days < 365) return `${Math.floor(days / 30)}m atrás`
    return `${Math.floor(days / 365)}a atrás`
}

function isActive(dateStr?: string | null): boolean {
    if (!dateStr) return false
    const diff = Date.now() - new Date(dateStr).getTime()
    return diff < 180 * 86400000 // 6 meses
}

export default function RepoHoverCard() {
    const { hoveredFood } = useWorldStore()
    const [pos, setPos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            setPos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', onMouseMove)
        return () => window.removeEventListener('mousemove', onMouseMove)
    }, [])

    if (!hoveredFood) return null

    const food = hoveredFood
    const active = isActive(food.repoLastCommit)

    const cardW = 300
    const cardH = 400
    const left = pos.x + 20 + cardW > window.innerWidth ? pos.x - cardW - 10 : pos.x + 20
    const top = pos.y + cardH > window.innerHeight ? pos.y - cardH : pos.y

    return (
        <div
            className="fixed z-50 w-75 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl overflow-hidden pointer-events-none"
            style={{ left, top }}
        >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#21262d]">
                {food.repoOwnerAvatar && (
                    <img
                        src={food.repoOwnerAvatar}
                        alt={food.repoOwner}
                        className="w-9 h-9 rounded-full border border-[#30363d]"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#c9d1d9] truncate">
                        {food.repoOwner}
                    </p>
                    {food.repoOwnerLocation && (
                        <p className="text-[10px] text-[#484f58] truncate">
                            📍 {food.repoOwnerLocation}
                        </p>
                    )}
                </div>
                {food.repoOwnerRepos && (
                    <span className="text-[10px] text-[#484f58] shrink-0">
                        {food.repoOwnerRepos} repos
                    </span>
                )}
            </div>

            {food.repoOwnerBio && (
                <p className="px-4 py-2 text-[10px] text-[#8b949e] border-b border-[#21262d] line-clamp-2">
                    {food.repoOwnerBio}
                </p>
            )}

            <div className="px-4 py-3 border-b border-[#21262d]">
                <p className="text-[12px] font-medium text-[#58a6ff] truncate mb-1">
                    {food.repoName}
                </p>
                {food.description && (
                    <p className="text-[10px] text-[#8b949e] line-clamp-2 leading-relaxed">
                        {food.description}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-4 divide-x divide-[#21262d] border-b border-[#21262d]">
                <div className="flex flex-col items-center py-2.5">
                    <span className="text-[11px] font-medium text-[#c9d1d9] tabular-nums">
                        {(food.repoStars ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#484f58]">stars</span>
                </div>
                <div className="flex flex-col items-center py-2.5">
                    <span className="text-[11px] font-medium text-[#c9d1d9] tabular-nums">
                        {(food.repoForks ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#484f58]">forks</span>
                </div>
                <div className="flex flex-col items-center py-2.5">
                    <span className="text-[11px] font-medium text-[#c9d1d9] tabular-nums">
                        {(food.repoWatchers ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#484f58]">watch</span>
                </div>
                <div className="flex flex-col items-center py-2.5">
                    <span className="text-[11px] font-medium text-[#f85149] tabular-nums">
                        {(food.repoOpenIssues ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#484f58]">issues</span>
                </div>
            </div>

            {food.repoLastCommit && (
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#21262d]">
                    <span className="text-[10px] text-[#484f58]">último commit</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#3fb950]' : 'bg-[#484f58]'}`} />
                        <span className="text-[10px] text-[#8b949e]">
                            {timeAgo(food.repoLastCommit)}
                        </span>
                    </div>
                </div>
            )}

            {food.repoReadme && (
                <div className="px-4 py-3">
                    <p className="text-[9px] text-[#484f58] uppercase tracking-widest mb-1.5">README</p>
                    <p className="text-[10px] text-[#8b949e] line-clamp-4 leading-relaxed font-mono whitespace-pre-wrap">
                        {food.repoReadme.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\n{3,}/g, '\n\n')}
                    </p>
                </div>
            )}
        </div>
    )
}