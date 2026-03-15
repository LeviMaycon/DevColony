'use client'

import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { useWorldStore } from '../../simulation/World'
import { AntGraphic, createAntGraphic, updateAntLegs } from '../../simulation/Ant'
import { generatePositions } from '../../simulation/placement'

const LANG_COLORS: Record<string, number> = {
    Python: 0x3572A5,
    JavaScript: 0xf1e05a,
    TypeScript: 0x2b7489,
    Rust: 0xdea584,
    Go: 0x00ADD8,
    Java: 0xb07219,
    'C++': 0xf34b7d,
    C: 0x555555,
    Ruby: 0x701516,
    Swift: 0xffac45,
    Kotlin: 0xF18E33,
    Shell: 0x89e051,
}

export default function SimulationCanvas() {
    const containerRef = useRef<HTMLDivElement>(null)
    const appRef = useRef<PIXI.Application | null>(null)
    const antGraphicsRef = useRef<Map<string, AntGraphic>>(new Map())
    const foodGraphicsRef = useRef<Map<string, PIXI.Container>>(new Map())
    const pheroLayerRef = useRef<PIXI.Graphics | null>(null)
    const sceneLayerRef = useRef<PIXI.Container | null>(null)
    const connLayerRef = useRef<PIXI.Graphics | null>(null)

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

            const connLayer = new PIXI.Graphics()
            sceneLayer.addChild(connLayer)
            connLayerRef.current = connLayer

            await PIXI.Assets.load(['/beetle-blue.png', '/beetle-gold.png'])
            if (destroyed) return

            useWorldStore.getState().initAnts()

            fetch('/api/github/search?q=simulation+python')
                .then((r) => r.json())
                .then((data) => {
                    if (destroyed) return
                    const repos = data.repos ?? []
                    const positions = generatePositions(repos.length, W, H)

                    repos.forEach((repo: any, i: number) => {
                        const { x, y } = positions[i]
                        useWorldStore.getState().addFood({
                            id: repo.id,
                            position: { x, y },
                            value: Math.min(10 + Math.log2(repo.repoStars + 1) * 4, 30),
                            discovered: false,
                            repoName: repo.repoName,
                            repoUrl: repo.repoUrl,
                            repoStars: repo.repoStars,
                            repoLanguage: repo.repoLanguage,
                            repoOwner: repo.repoOwner,
                            repoOwnerAvatar: repo.repoOwnerAvatar,
                            repoCreatedAt: repo.repoCreatedAt,
                            description: repo.description,
                        })
                    })
                })

            let frameCount = 0

            app.ticker.add((ticker) => {
                if (destroyed) return
                frameCount++

                useWorldStore.getState().tick(ticker.deltaTime)

                const { ants, foods, colony, pheromones, selectedAntId, selectedLanguages } = useWorldStore.getState()
                const antMap = antGraphicsRef.current
                const foodMap = foodGraphicsRef.current
                const phero = pheroLayerRef.current
                const scene = sceneLayerRef.current
                const connLayer = connLayerRef.current
                if (!scene || !phero || !connLayer) return

                // Feromônio
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

                // Conexões por linguagem — redesenha a cada frame
                connLayer.clear()
                if (selectedLanguages.length > 0) {
                    selectedLanguages.forEach((lang) => {
                        const langFoods = foods.filter(
                            (f) => f.repoLanguage === lang && !f.discovered
                        )
                        const color = LANG_COLORS[lang] ?? 0x8b949e

                        for (let i = 0; i < langFoods.length; i++) {
                            for (let j = i + 1; j < langFoods.length; j++) {
                                const a = langFoods[i]
                                const b = langFoods[j]
                                const dist = Math.hypot(
                                    b.position.x - a.position.x,
                                    b.position.y - a.position.y
                                )
                                const alpha = Math.max(0, 1 - dist / 600) * 0.35
                                if (alpha <= 0) continue
                                connLayer.moveTo(a.position.x, a.position.y)
                                connLayer.lineTo(b.position.x, b.position.y)
                                connLayer.stroke({ color, alpha, width: 0.5 })
                            }
                        }
                    })
                }

                // Limpeza de comidas removidas
                const activeFoodIds = new Set(foods.map((f) => f.id))
                foodMap.forEach((container, id) => {
                    if (!activeFoodIds.has(id)) {
                        scene.removeChild(container)
                        container.destroy()
                        foodMap.delete(id)
                    }
                })

                // Comidas
                foods.forEach((food) => {
                    if (foodMap.has(food.id)) return
                    const container = new PIXI.Container()
                    const radius = food.value / 1.9

                    const glow = new PIXI.Graphics()
                    glow.circle(0, 0, radius + 6)
                    glow.fill({ color: 0x3fb950, alpha: 0.08 })
                    glow.circle(0, 0, radius + 3)
                    glow.fill({ color: 0x3fb950, alpha: 0.15 })
                    container.addChild(glow)

                    const fallback = new PIXI.Graphics()
                    fallback.circle(0, 0, radius)
                    fallback.fill({ color: 0x238636 })
                    container.addChild(fallback)

                    const border = new PIXI.Graphics()
                    border.circle(0, 0, radius)
                    border.setStrokeStyle({ width: 1, color: 0x3fb950, alpha: 0.5 })
                    border.stroke()
                    container.addChild(border)

                    if (food.repoName) {
                        const label = new PIXI.Text({
                            text: food.repoName.split('/')[1] ?? food.repoName,
                            style: new PIXI.TextStyle({
                                fontSize: 9,
                                fill: '#3fb950',
                                fontFamily: 'monospace',
                            })
                        })
                        label.anchor.set(0.5, 1)
                        label.x = 0
                        label.y = -radius - 4
                        container.addChild(label)
                    }

                    container.x = food.position.x
                    container.y = food.position.y
                    foodMap.set(food.id, container)
                    scene.addChild(container)

                    if (food.repoOwnerAvatar && !food.discovered) {
                        const img = new Image()
                        img.crossOrigin = 'anonymous'
                        img.src = `/api/github/avatar?url=${encodeURIComponent(food.repoOwnerAvatar)}`

                        img.onload = () => {
                            if (!foodMap.has(food.id)) return
                            const size = Math.ceil(radius * 2)
                            const cv = document.createElement('canvas')
                            cv.width = size
                            cv.height = size
                            const ctx = cv.getContext('2d')!
                            ctx.beginPath()
                            ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2)
                            ctx.closePath()
                            ctx.clip()
                            ctx.drawImage(img, 0, 0, size, size)
                            const texture = PIXI.Texture.from(cv)
                            const sprite = new PIXI.Sprite(texture)
                            sprite.anchor.set(0.5)
                            container.removeChildAt(1)
                            container.addChildAt(sprite, 1)
                        }
                    }
                })

                // Formigueiro
                if (!scene.getChildByLabel('mound')) {
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

                // Formigas
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