'use client'

import { AntEntity, FoodSource } from "../../simulation/types"
import { useWorldStore } from "../../simulation/World"
import { Badge } from "@/src/core/components/ui/badge"
import { Separator } from "@/src/core/components/ui/separator"
import { ScrollArea } from "@/src/core/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/core/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function SimulationSidebar() {
    const { ants, collectedRepos, selectedAntId, selectAnt } = useWorldStore()

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex flex-col gap-2 w-80 h-150 font-mono">
                <AntsPanel ants={ants} selectedId={selectedAntId} onSelect={selectAnt} />
                <ColonyPanel repos={collectedRepos} />
            </div>
        </TooltipProvider>
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

            {/* Stats */}
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
        <div className="flex flex-col rounded-md border border-[#30363d] bg-[#0d1117] max-h-55">

            {/* Header */}
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
                        {repos.map((repo) => (
                            <RepoRow key={repo.id} repo={repo} />
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

            {
                repo.description && (
                    <span className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">
                        {repo.description}
                    </span>
                )
            }

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                {repo.repoOwner && (
                    <span className="text-[10px] text-white/50">
                        👤 {repo.repoOwner}
                    </span>
                )}
                {repo.repoCreatedAt && (
                    <span className="text-[10px] text-white/50">
                        📅 {repo.repoCreatedAt}
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
        </a >
    )
}