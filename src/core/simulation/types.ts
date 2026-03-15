export interface Vector2 {
    x: number
    y: number
}

export interface FoodSource {
    id: string
    position: Vector2
    value: number
    discovered: boolean
    repoName?: string
    repoUrl?: string
    repoStars?: number
    repoLanguage?: string
    repoOwner?: string    
    repoCreatedAt?: string 
    description?: string
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