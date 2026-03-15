export interface PheromoneGrid {
    width: number
    height: number
    cellSize: number
    values: Float32Array
}

export function createPheromoneGrid(worldW: number, worldH: number, cellSize = 8): PheromoneGrid {
    const width = Math.ceil(worldW / cellSize)
    const height = Math.ceil(worldH / cellSize)
    return {
        width,
        height,
        cellSize,
        values: new Float32Array(width * height), // começa tudo zerado
    }
}

export function depositPheromone(grid: PheromoneGrid, x: number, y: number, amount: number) {
    const cx = Math.floor(x / grid.cellSize)
    const cy = Math.floor(y / grid.cellSize)
    if (cx < 0 || cy < 0 || cx >= grid.width || cy >= grid.height) return
    const idx = cy * grid.width + cx
    grid.values[idx] = Math.min(grid.values[idx] + amount, 1.0) // máximo 1.0
}

export function evaporatePheromone(grid: PheromoneGrid, rate: number) {
    for (let i = 0; i < grid.values.length; i++) {
        grid.values[i] *= (1 - rate)
        if (grid.values[i] < 0.005) grid.values[i] = 0 // limpa resíduos
    }
}