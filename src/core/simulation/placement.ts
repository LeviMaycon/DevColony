interface PlacedItem {
    x: number
    y: number
}

export function generatePositions(
    count: number,
    W: number,
    H: number,
    margin = 80
): PlacedItem[] {
    const cols = Math.ceil(Math.sqrt(count * (W / H)))
    const rows = Math.ceil(count / cols)

    const cellW = (W - margin * 2) / cols
    const cellH = (H - margin * 2) / rows

    const positions: PlacedItem[] = []

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (positions.length >= count) break

            const jitterX = (Math.random() - 0.5) * cellW * 0.4
            const jitterY = (Math.random() - 0.5) * cellH * 0.4

            positions.push({
                x: margin + col * cellW + cellW / 2 + jitterX,
                y: margin + row * cellH + cellH / 2 + jitterY,
            })
        }
    }

    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    return positions
}