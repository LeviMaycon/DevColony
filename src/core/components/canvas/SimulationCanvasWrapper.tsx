'use client'

import dynamic from 'next/dynamic'

const SimulationCanvas = dynamic(
    () => import('./SimulationCanvas'),
    { ssr: false }
)

export default function SimulationCanvasWrapper() {
    return <SimulationCanvas />
}