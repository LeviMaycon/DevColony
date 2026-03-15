'use client'

import dynamic from 'next/dynamic'

const SimulationSidebar = dynamic(
    () => import('./SimulationSidebar'),
    { ssr: false }
)

export default function SimulationSidebarWrapper() {
    return <SimulationSidebar />
}