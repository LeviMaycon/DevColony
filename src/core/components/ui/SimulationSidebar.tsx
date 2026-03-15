'use client'

import { AntEntity, FoodSource } from "../../simulation/types"
import { useWorldStore } from "../../simulation/World"
import { Badge } from "@/src/core/components/ui/badge"
import { Separator } from "@/src/core/components/ui/separator"
import { ScrollArea } from "@/src/core/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/core/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Resizable } from "re-resizable"

export default function SimulationSidebar() {
    const { ants, collectedRepos, selectedAntId, selectAnt, foods, selectedLanguages, toggleLanguage } = useWorldStore()

    return (
        <TooltipProvider delayDuration={300}>
            <Resizable
                defaultSize={{ width: 280, height: 600 }}
                minWidth={200}
                maxWidth={500}
                minHeight={300}
                enable={{
                    top: false,
                    right: false,
                    bottom: true,
                    left: true,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: true,
                    topLeft: false,
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
                <AntsPanel ants={ants} selectedId={selectedAntId} onSelect={selectAnt} />
                <LanguageFilter
                    foods={foods}
                    selectedLanguages={selectedLanguages}
                    onToggle={toggleLanguage}
                />
                <ColonyPanel repos={collectedRepos} />
            </Resizable>
        </TooltipProvider>
    )
}

function LanguageFilter({
    foods,
    selectedLanguages,
    onToggle,
}: {
    foods: FoodSource[]
    selectedLanguages: string[]
    onToggle: (lang: string) => void
}) {
    // Conta repos por linguagem
    const langCount = foods.reduce((acc, food) => {
        if (!food.repoLanguage) return acc
        acc[food.repoLanguage] = (acc[food.repoLanguage] ?? 0) + 1
        return acc
    }, {} as Record<string, number>)

    const languages = Object.entries(langCount).sort((a, b) => b[1] - a[1])

    if (languages.length === 0) return null

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

    return (
        <div className="flex flex-col rounded-md border border-[#30363d] bg-[#0d1117]">
            <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b949e]">
                    Linguagens
                </span>
                {selectedLanguages.length > 0 && (
                    <button
                        onClick={() => selectedLanguages.forEach(onToggle)}
                        className="text-[9px] text-[#484f58] hover:text-[#8b949e] transition-colors"
                    >
                        limpar
                    </button>
                )}
            </div>

            <Separator className="bg-[#21262d]" />

            <div className="flex flex-wrap gap-1.5 p-3">
                {languages.map(([lang, count]) => {
                    const isSelected = selectedLanguages.includes(lang)
                    const color = LANG_COLORS[lang] ?? '#8b949e'

                    return (
                        <button
                            key={lang}
                            onClick={() => onToggle(lang)}
                            className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded text-[10px] transition-all',
                                'border hover:opacity-90',
                                isSelected
                                    ? 'bg-[#161b22] border-[#30363d] opacity-100'
                                    : 'bg-transparent border-[#21262d] opacity-50'
                            )}
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-[#c9d1d9]">{lang}</span>
                            <span className="text-[#484f58] tabular-nums">{count}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function AntsPanel({
    ants,
    selectedId,
    onSelect,
}: {
    ants: AntEntity[]
    selectedId: string | null
    onSelect: (id: string | null) => void
}) {
    const exploring = ants.filter((a) => a.state === 'exploring').length
    const returning = ants.filter((a) => a.state === 'returning').length

    return (
        <div className="flex flex-col flex-1 min-h-0 rounded-md border border-[#30363d] bg-[#0d1117]">
            <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b949e]">
                    Formigas
                </span>
                <Badge
                    variant="outline"
                    className="text-[10px] tabular-nums text-[#484f58] bg-[#161b22] border-[#30363d] rounded-full px-1.5 py-0"
                >
                    {ants.length}
                </Badge>
            </div>

            <Separator className="bg-[#21262d]" />

            <div className="grid grid-cols-2 divide-x divide-[#21262d] shrink-0">
                <div className="px-3 py-2.5">
                    <p className="text-[9px] tracking-widest uppercase text-[#484f58] mb-1">Explorar</p>
                    <p className="text-lg font-light tabular-nums text-[#8b949e]">{exploring}</p>
                </div>
                <div className="px-3 py-2.5">
                    <p className="text-[9px] tracking-widest uppercase text-[#484f58] mb-1">Retornar</p>
                    <p className="text-lg font-light tabular-nums text-[#3fb950]">{returning}</p>
                </div>
            </div>

            <Separator className="bg-[#21262d]" />

            <ScrollArea className="flex-1 min-h-0">
                <div>
                    {ants.map((ant) => (
                        <AntRow
                            key={ant.id}
                            ant={ant}
                            selected={ant.id === selectedId}
                            onSelect={() => onSelect(ant.id === selectedId ? null : ant.id)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

function AntRow({
    ant,
    selected,
    onSelect,
}: {
    ant: AntEntity
    selected: boolean
    onSelect: () => void
}) {
    const isReturning = ant.state === 'returning'
    const label = ant.id.replace('ant-', '')
    const repoLabel = ant.targetFood?.repoName ?? ant.targetFood?.id

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onSelect}
                    className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-left',
                        'border-b border-[#161b22] border-l-2',
                        'transition-colors duration-100 hover:bg-[#161b22]',
                        selected
                            ? 'bg-[#161b22] border-l-[#58a6ff]'
                            : 'border-l-transparent'
                    )}
                >
                    <span className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0 transition-colors',
                        isReturning ? 'bg-[#3fb950]' : 'bg-[#30363d]'
                    )} />

                    <div className="flex-1 min-w-0">
                        <p className={cn(
                            'text-[11px] tabular-nums transition-colors',
                            selected ? 'text-[#c9d1d9]' : 'text-[#8b949e]'
                        )}>
                            #{label}
                        </p>
                        {isReturning && repoLabel && (
                            <p className="text-[10px] text-[#3fb950]/50 truncate mt-0.5">
                                {repoLabel}
                            </p>
                        )}
                    </div>

                    {isReturning && (
                        <span className="text-[9px] text-[#3fb950]/60">↩</span>
                    )}
                </button>
            </TooltipTrigger>
            {isReturning && repoLabel && (
                <TooltipContent
                    side="left"
                    className="text-[11px] font-mono bg-[#161b22] border-[#30363d] text-[#c9d1d9]"
                >
                    {repoLabel}
                </TooltipContent>
            )}
        </Tooltip>
    )
}

function ColonyPanel({ repos }: { repos: FoodSource[] }) {
    return (
        <div className="flex flex-col rounded-md border border-[#30363d] bg-[#0d1117] max-h-75">
            <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b949e]">
                    Formigueiro
                </span>
                <Badge
                    variant="outline"
                    className="text-[10px] tabular-nums text-[#484f58] bg-[#161b22] border-[#30363d] rounded-full px-1.5 py-0"
                >
                    {repos.length}
                </Badge>
            </div>

            <Separator className="bg-[#21262d]" />

            {repos.length === 0 ? (
                <p className="text-[10px] text-[#484f58] text-center py-8 tracking-[0.15em] uppercase">
                    vazio
                </p>
            ) : (
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div>
                        {repos.map((repo, index) => (
                            <RepoRow key={`${repo.id}-${index}`} repo={repo} />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    )
}

function RepoRow({ repo }: { repo: FoodSource }) {
    return (
        <a
            href={repo.repoUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors gap-1"
        >
            <span className="text-xs font-medium text-blue-400 hover:underline truncate">
                {repo.repoName ?? repo.id}
            </span>

            {repo.description && (
                <span className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">
                    {repo.description}
                </span>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                {repo.repoOwner && (
                    <span className="text-[10px] text-white/50">
                        <a
                            href={`https://github.com/${repo.repoOwner}`}
                            target="_blank"
                            className="hover:underline truncate text-blue-400 font-xs"
                        >
                            {repo.repoOwner}
                        </a>
                    </span>
                )}
                {repo.repoCreatedAt && (
                    <span className="text-[10px] text-white/50">
                        {repo.repoCreatedAt}
                    </span>
                )}
                {repo.repoStars !== undefined && (
                    <span className="text-[10px] text-yellow-400/80">
                        ★ {repo.repoStars.toLocaleString()}
                    </span>
                )}
                {repo.repoLanguage && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                        {repo.repoLanguage}
                    </span>
                )}
            </div>
        </a>
    )
}