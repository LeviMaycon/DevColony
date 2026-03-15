export interface Vector2 {
    x: number
    y: number
}

export interface FoodSource {
    id: string
    position: Vector2
    value: number        // "tamanho" da comida
    discovered: boolean
    repoName?: string      // nome do repo
    repoUrl?: string       // link pro GitHub
    repoStars?: number     // stars
    repoLanguage?: string  // linguagem principal
    }

export type AntState = 'exploring' | 'returning'

export interface AntEntity {
    id: string
    position: Vector2
    angle: number        // direção em radianos
    state: AntState
    targetFood?: FoodSource
    legPhase: number
}