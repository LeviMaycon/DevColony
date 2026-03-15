'use client'

import { AntEntity, FoodSource } from "../../simulation/types"
import { useWorldStore } from "../../simulation/World"

export default function SimulationSidebar() {
    const { ants, collectedRepos, selectedAntId, selectAnt } = useWorldStore()

    return (
        <div className="flex flex-col gap-2 w-64 h-150 font-mono">
            <AntsPanel ants={ants} selectedId={selectedAntId} onSelect={selectAnt} />
            <ColonyPanel repos={collectedRepos} />
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
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#21262d]">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b949e]">
                    Formigas
                </span>
                <span className="text-[10px] tabular-nums text-[#484f58] bg-[#161b22] border border-[#30363d] px-1.5 py-0.5 rounded-full">
                    {ants.length}
                </span>
            </div>

            <div className="grid grid-cols-2 border-b border-[#21262d]">
                <div className="px-3 py-2.5 border-r border-[#21262d]">
                    <p className="text-[9px] tracking-widest uppercase text-[#484f58] mb-1">Explorar</p>
                    <p className="text-lg font-light tabular-nums text-[#8b949e]">{exploring}</p>
                </div>
                <div className="px-3 py-2.5">
                    <p className="text-[9px] tracking-widest uppercase text-[#484f58] mb-1">Retornar</p>
                    <p className="text-lg font-light tabular-nums text-[#3fb950]">{returning}</p>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-none">
                {ants.map((ant) => (
                    <AntRow
                        key={ant.id}
                        ant={ant}
                        selected={ant.id === selectedId}
                        onSelect={() => onSelect(ant.id === selectedId ? null : ant.id)}
                    />
                ))}
            </div>
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

    return (
        <button
            onClick={onSelect}
            className={`
                w-full flex items-center gap-2.5 px-3 py-2 text-left
                border-b border-[#161b22] transition-colors duration-100
                hover:bg-[#161b22]
                ${selected ? 'bg-[#161b22] border-l-2 border-l-[#58a6ff]' : 'border-l-2 border-l-transparent'}
            `}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isReturning ? 'bg-[#3fb950]' : 'bg-[#30363d]'
                }`} />

            <div className="flex-1 min-w-0">
                <p className={`text-[11px] tabular-nums transition-colors ${selected ? 'text-[#c9d1d9]' : 'text-[#8b949e]'
                    }`}>
                    #{label}
                </p>
                {isReturning && ant.targetFood && (
                    <p className="text-[10px] text-[#3fb950]/50 truncate mt-0.5">
                        {ant.targetFood.repoName ?? ant.targetFood.id}
                    </p>
                )}
            </div>

            {isReturning && (
                <span className="text-[9px] text-[#3fb950]/60">↩</span>
            )}
        </button>
    )
}

function ColonyPanel({ repos }: { repos: FoodSource[] }) {
    return (
        <div className="flex flex-col rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden" style={{ maxHeight: '220px' }}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#21262d] shrink-0">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8b949e]">
                    Formigueiro
                </span>
                <span className="text-[10px] tabular-nums text-[#484f58] bg-[#161b22] border border-[#30363d] px-1.5 py-0.5 rounded-full">
                    {repos.length}
                </span>
            </div>

            {repos.length === 0 ? (
                <p className="text-[10px] text-[#484f58] text-center py-8 tracking-[0.15em] uppercase">
                    vazio
                </p>
            ) : (
                <div className="overflow-y-auto scrollbar-none">
                    {repos.map((repo) => (
                        <RepoRow key={repo.id} repo={repo} />
                    ))}
                </div>
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
            className="flex items-center justify-between px-3 py-2 border-b border-[#161b22] hover:bg-[#161b22] transition-colors group"
        >
            <span className="text-[11px] text-[#58a6ff] group-hover:underline truncate mr-3 leading-tight">
                {repo.repoName ?? repo.id}
            </span>

            <div className="flex items-center gap-2 shrink-0">
                {repo.repoStars !== undefined && (
                    <span className="text-[10px] tabular-nums text-[#fafa00]">
                        ★ {repo.repoStars.toLocaleString()}
                    </span>
                )}
                {repo.repoLanguage && (
                    <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border border-[#30363d] ${repo.repoLanguage === "Unknown"
                                ? "text-red-800 font-bold"
                                : "text-white"
                            }`}
                    >
                        {repo.repoLanguage}
                    </span>
                )}
            </div>
        </a>
    )
}