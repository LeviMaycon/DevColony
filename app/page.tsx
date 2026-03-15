import SimulationCanvasWrapper from "@/src/core/components/canvas/SimulationCanvasWrapper";
import SearchBarWrapper from "@/src/core/components/ui/SearchBarWrapper";
import SimulationSidebarWrapper from "@/src/core/components/ui/SimulationSidebarWrapper";

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0d0d1a]">

      <SimulationCanvasWrapper />

      <div className="absolute top-4 right-4 flex flex-col gap-3 w-72">
        <SearchBarWrapper />
        <SimulationSidebarWrapper />
      </div>

    </main>
  )
}