import { create } from 'zustand'
import { AntEntity, FoodSource, Vector2 } from './types'
import { createAnt, updateAnt } from './Ant'
import { PheromoneGrid, createPheromoneGrid, depositPheromone, evaporatePheromone } from './Pheromone'

// if you put more 1000 probaly you chrome crash
const ANT_COUNT = 50
const EVAPORATION_RATE = 0.008
const DEPOSIT_AMOUNT = 0.15

interface WorldState {
    ants: AntEntity[]
    foods: FoodSource[]
    colony: Vector2
    worldSize: Vector2
    pheromones: PheromoneGrid
    selectedAntId: string | null
    collectedRepos: FoodSource[]
    setWorldSize: (size: Vector2) => void
    setColony: (pos: Vector2) => void
    clearFoods: () => void
    tick: (delta: number) => void
    addFood: (food: FoodSource) => void
    initAnts: () => void
    selectAnt: (id: string | null) => void
}

export const useWorldStore = create<WorldState>((set, get) => ({
    ants: [],
    foods: [],
    colony: { x: 400, y: 300 },
    worldSize: { x: 800, y: 600 },
    pheromones: createPheromoneGrid(800, 600, 8),
    selectedAntId: null,
    collectedRepos: [],

    setWorldSize: (size) => set({ worldSize: size, pheromones: createPheromoneGrid(size.x, size.y, 8) }),
    setColony: (pos) => set({ colony: pos }),
    clearFoods: () => set({ foods: [], collectedRepos: [] }),
    initAnts: () => {
        const { colony } = get()
        const ants = Array.from({ length: ANT_COUNT }, (_, i) =>
            createAnt(`ant-${i}`, { ...colony })
        )
        set({ ants })
    },

    tick: (delta: number) => {
        const { ants, foods, worldSize, colony, pheromones, collectedRepos } = get()

        const updatedAnts = ants.map((ant) =>
            updateAnt(ant, foods, worldSize, colony, delta)
        )

        updatedAnts.forEach((ant) => {
            if (ant.state === 'returning') {
                depositPheromone(pheromones, ant.position.x, ant.position.y, DEPOSIT_AMOUNT * delta)
            }
        })

        evaporatePheromone(pheromones, EVAPORATION_RATE * delta)

        const discoveredIds = new Set(
            updatedAnts
                .filter((a) => a.state === 'returning' && a.targetFood)
                .map((a) => a.targetFood!.id)
        )

        const updatedFoods = foods.map((f) =>
            discoveredIds.has(f.id) ? { ...f, discovered: true } : f
        )

        const newlyCollected: FoodSource[] = []
        ants.forEach((oldAnt, i) => {
            const newAnt = updatedAnts[i]
            if (
                oldAnt.state === 'returning' &&
                newAnt.state === 'exploring' &&
                oldAnt.targetFood &&
                !collectedRepos.find((r) => r.id === oldAnt.targetFood!.id) &&
                !newlyCollected.find((r) => r.id === oldAnt.targetFood!.id)
            ) {
                newlyCollected.push(oldAnt.targetFood)
            }
        })

        set({
            ants: updatedAnts,
            foods: updatedFoods,
            collectedRepos: [...collectedRepos, ...newlyCollected],
        })
    },

    addFood: (food) => set((s) => ({ foods: [...s.foods, food] })),
    selectAnt: (id) => set({ selectedAntId: id }),
}))