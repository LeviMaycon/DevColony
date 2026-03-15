import SimulationCanvasWrapper from "@/src/core/components/canvas/SimulationCanvasWrapper"
import LanguageFilterWrapper from "@/src/core/components/ui/LanguageFilterWrapper"
import RepoHoverCardWrapper from "@/src/core/components/ui/RepoHoverCardWrapper"
import SearchBarWrapper from "@/src/core/components/ui/SearchBarWrapper"
import SimulationSidebarWrapper from "@/src/core/components/ui/SimulationSidebarWrapper"


export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0d0d1a]">

      <SimulationCanvasWrapper />

      {/* Esquerda — busca + formigas + formigueiro */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 w-72">
        <SearchBarWrapper />
        <SimulationSidebarWrapper />
      </div>

      {/* Direita — filtro de linguagens */}
      <div className="absolute top-4 right-4">
        <LanguageFilterWrapper />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/20 font-mono select-none">
        scroll para zoom · arrastar para mover
      </div>

      <RepoHoverCardWrapper />
    
    </main>
  )
}