'use client'

import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { useWorldStore } from '../../simulation/World'
import { AntGraphic, createAntGraphic, updateAntLegs } from '../../simulation/Ant'

export default function SimulationCanvas() {
    const containerRef = useRef<HTMLDivElement>(null)
    const appRef = useRef<PIXI.Application | null>(null)
    const antGraphicsRef = useRef<Map<string, AntGraphic>>(new Map())
    const foodGraphicsRef = useRef<Map<string, PIXI.Graphics>>(new Map())
    const pheroLayerRef = useRef<PIXI.Graphics | null>(null)
    const sceneLayerRef = useRef<PIXI.Container | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const W = window.innerWidth
        const H = window.innerHeight

        useWorldStore.getState().setWorldSize({ x: W, y: H })
        useWorldStore.getState().setColony({ x: W / 2, y: H / 2 })

        let destroyed = false
        const app = new PIXI.Application()

        const init = async () => {
            await app.init({
                width: W,
                height: H,
                background: 0x0d1117,
                antialias: true,
            })

            if (destroyed || !containerRef.current) return

            containerRef.current.appendChild(app.canvas)
            appRef.current = app

            const pheroLayer = new PIXI.Graphics()
            app.stage.addChild(pheroLayer)
            pheroLayerRef.current = pheroLayer

            const sceneLayer = new PIXI.Container()
            app.stage.addChild(sceneLayer)
            sceneLayerRef.current = sceneLayer

            await PIXI.Assets.load(['/beetle-blue.png', '/beetle-gold.png'])
            if (destroyed) return

            useWorldStore.getState().initAnts()

            fetch('/api/github/search?q=simulation+python')
                .then((r) => r.json())
                .then((data) => {
                    if (destroyed) return
                    data.repos?.forEach((repo: any) => {
                        useWorldStore.getState().addFood({
                            id: repo.id,
                            position: {
                                x: 60 + Math.random() * (W - 120),
                                y: 60 + Math.random() * (H - 120),
                            },
                            value: Math.min(10 + Math.log2(repo.repoStars + 1) * 4, 30),
                            discovered: false,
                            repoName: repo.repoName,
                            repoUrl: repo.repoUrl,
                            repoStars: repo.repoStars,
                            repoLanguage: repo.repoLanguage,
                        })
                    })
                })

            let frameCount = 0

            app.ticker.add((ticker) => {
                if (destroyed) return
                frameCount++

                useWorldStore.getState().tick(ticker.deltaTime)

                const { ants, foods, colony, pheromones, selectedAntId } = useWorldStore.getState()
                const antMap  = antGraphicsRef.current
                const foodMap = foodGraphicsRef.current
                const phero   = pheroLayerRef.current
                const scene   = sceneLayerRef.current
                if (!scene || !phero) return

                if (frameCount % 3 === 0) {
                    phero.clear()
                    const { values, width, cellSize } = pheromones
                    for (let i = 0; i < values.length; i++) {
                        const v = values[i]
                        if (v < 0.01) continue
                        const cx = (i % width) * cellSize
                        const cy = Math.floor(i / width) * cellSize
                        phero.rect(cx, cy, cellSize, cellSize)
                        phero.fill({ color: 0x3fb950, alpha: v * 0.18 })
                    }
                }

                const activeFoodIds = new Set(foods.map((f) => f.id))
                foodMap.forEach((gfx, id) => {
                    if (!activeFoodIds.has(id)) {
                        scene.removeChild(gfx)
                        gfx.destroy()
                        foodMap.delete(id)
                    }
                })

                foods.forEach((food) => {
                    if (foodMap.has(food.id)) return

                    const gfx = new PIXI.Graphics()
                    const radius = food.value / 3

                    if (!food.discovered) {
                        gfx.circle(food.position.x, food.position.y, radius + 5)
                        gfx.fill({ color: 0x3fb950, alpha: 0.06 })
                        gfx.circle(food.position.x, food.position.y, radius + 2)
                        gfx.fill({ color: 0x3fb950, alpha: 0.12 })
                    }

                    gfx.circle(food.position.x, food.position.y, radius)
                    gfx.fill({ color: food.discovered ? 0x21262d : 0x238636 })

                    if (!food.discovered) {
                        gfx.circle(food.position.x, food.position.y, radius)
                        gfx.setStrokeStyle({ width: 0.5, color: 0x3fb950, alpha: 0.4 })
                        gfx.stroke()
                    }

                    if (food.repoName && !food.discovered) {
                        const label = new PIXI.Text({
                            text: food.repoUrl ?? food.repoName,
                            style: new PIXI.TextStyle({
                                fontSize: 9,
                                fill: '#3fb950',
                                fontFamily: 'monospace',
                            })
                        })
                        label.anchor.set(0.5, 1)
                        label.x = food.position.x
                        label.y = food.position.y - radius - 4
                        gfx.addChild(label)
                    }

                    foodMap.set(food.id, gfx)
                    scene.addChild(gfx)
                })

                if (!scene.getChildByName('mound')) {
                    const mound = new PIXI.Graphics()
                    mound.label = 'mound'
                    mound.circle(colony.x, colony.y, 14)
                    mound.fill({ color: 0x161b22 })
                    mound.circle(colony.x, colony.y, 14)
                    mound.setStrokeStyle({ width: 1, color: 0x30363d })
                    mound.stroke()
                    mound.circle(colony.x, colony.y, 7)
                    mound.fill({ color: 0x21262d })
                    mound.circle(colony.x, colony.y, 3)
                    mound.fill({ color: 0x0d1117 })
                    mound.circle(colony.x, colony.y, 3)
                    mound.setStrokeStyle({ width: 0.5, color: 0x3fb950, alpha: 0.5 })
                    mound.stroke()
                    scene.addChild(mound)
                }

                ants.forEach((ant) => {
                    const isReturning = ant.state === 'returning'
                    let graphic = antMap.get(ant.id)

                    if (!graphic || graphic.isReturning !== isReturning) {
                        if (graphic) scene.removeChild(graphic.container)
                        graphic = createAntGraphic(isReturning)
                        antMap.set(ant.id, graphic)
                        scene.addChild(graphic.container)
                    }

                    graphic.container.x = ant.position.x
                    graphic.container.y = ant.position.y
                    graphic.container.rotation = ant.angle + Math.PI / 2
                    updateAntLegs(graphic, ant.legPhase)

                    if (ant.id === selectedAntId) {
                        if (graphic.container.children.length <= 1) {
                            const ring = new PIXI.Graphics()
                            ring.circle(0, 0, 16)
                            ring.setStrokeStyle({ width: 1, color: 0x58a6ff, alpha: 0.7 })
                            ring.stroke()
                            graphic.container.addChild(ring)
                        }
                    } else {
                        if (graphic.container.children.length > 1) {
                            graphic.container.removeChildAt(graphic.container.children.length - 1)
                        }
                    }
                })
            })
        }

        init()

        return () => {
            destroyed = true
            if (appRef.current) {
                appRef.current.destroy(true)
                appRef.current = null
            }
            antGraphicsRef.current.clear()
            foodGraphicsRef.current.clear()
        }
    }, [])

    return <div ref={containerRef} className="w-screen h-screen" />
}