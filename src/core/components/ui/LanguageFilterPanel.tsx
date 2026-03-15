'use client'

import { useWorldStore } from '../../simulation/World'
import { Separator } from '@/src/core/components/ui/separator'
import { cn } from '@/lib/utils'
import { FoodSource } from '../../simulation/types'

const LANG_COLORS: Record<string, string> = {
    Python: '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Shell: '#89e051',
    Dockerfile: '#384d54',
}

export default function LanguageFilterPanel() {
    const { foods, selectedLanguages, toggleLanguage } = useWorldStore()

    const langCount = foods.reduce((acc, food) => {
        if (!food.repoLanguage) return acc
        acc[food.repoLanguage] = (acc[food.repoLanguage] ?? 0) + 1
        return acc
    }, {} as Record<string, number>)

    const languages = Object.entries(langCount).sort((a, b) => b[1] - a[1])

    if (languages.length === 0) return null

    return (
        <div className="flex flex-col rounded-md border border-[#30363d] bg-[#0d1117] w-56">
            <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b949e]">
                    Linguagens
                </span>
                {selectedLanguages.length > 0 && (
                    <button
                        onClick={() => selectedLanguages.forEach(toggleLanguage)}
                        className="text-[9px] text-[#484f58] hover:text-[#8b949e] transition-colors"
                    >
                        limpar
                    </button>
                )}
            </div>

            <Separator className="bg-[#21262d]" />

            <div className="flex flex-col gap-0.5 p-2 max-h-[70vh] overflow-y-auto">
                {languages.map(([lang, count]) => {
                    const isSelected = selectedLanguages.includes(lang)
                    const color = LANG_COLORS[lang] ?? '#8b949e'

                    return (
                        <button
                            key={lang}
                            onClick={() => toggleLanguage(lang)}
                            className={cn(
                                'flex items-center justify-between px-2 py-1.5 rounded text-[10px] transition-all w-full',
                                'hover:bg-[#161b22]',
                                isSelected ? 'opacity-100' : 'opacity-50'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-[#c9d1d9]">{lang}</span>
                            </div>
                            <span className="text-white tabular-nums">{count}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}