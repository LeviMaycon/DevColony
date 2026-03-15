import { AntEntity, FoodSource, Vector2 } from "./types"
import * as PIXI from 'pixi.js'

const SPEED = 0.7;
const WANDER_STRENGTH = 0.4;

const SPRITE_COLS   = 12
const SPRITE_ROWS   = 1
const FRAME_W       = 64
const FRAME_H       = 80
const TOTAL_FRAMES  = 12

const SPRITE_SHEETS = [
    '/beetle-blue.png',
    '/beetle-gold.png',
]

export function createAnt(id: string, position: Vector2): AntEntity {
    return {
        id,
        position: { ...position },
        angle: Math.random() * Math.PI * 2,
        state: 'exploring',
        legPhase: Math.random() * Math.PI * 2,
    }
}

export function updateAnt(
    ant: AntEntity,
    foods: FoodSource[],
    worldSize: Vector2,
    colony: Vector2,
    delta: number
): AntEntity {
    const updated = ant.state === 'exploring'
        ? exploreStep(ant, foods, worldSize, delta)
        : returnStep(ant, colony, delta)

    return {
        ...updated,
        legPhase: (ant.legPhase + delta * 0.18) % (Math.PI * 2),
    }
}

function exploreStep(ant: AntEntity, foods: FoodSource[], worldSize: Vector2, delta: number): AntEntity {
    const newAngle = ant.angle + (Math.random() - 0.5) * WANDER_STRENGTH
    const newPos = {
        x: ant.position.x + Math.cos(newAngle) * SPEED * delta,
        y: ant.position.y + Math.sin(newAngle) * SPEED * delta,
    }
    const bounced = bounceBorders(newPos, newAngle, worldSize)

    // Só checa foods não descobertos — pula os já coletados
    const undiscovered = foods.filter((f) => !f.discovered)
    const found = undiscovered.find((f) => distance(bounced.position, f.position) < 15)

    if (found) return { ...ant, ...bounced, state: 'returning', targetFood: found }
    return { ...ant, ...bounced }
}

function returnStep(ant: AntEntity, colony: Vector2, delta: number): AntEntity {
    const dx = colony.x - ant.position.x;
    const dy = colony.y - ant.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
        return { ...ant, state: 'exploring', targetFood: undefined };
    }

    const angle = Math.atan2(dy, dx)
    return {
        ...ant,
        angle,
        position: {
            x: ant.position.x + Math.cos(angle) * SPEED * delta,
            y: ant.position.y + Math.sin(angle) * SPEED * delta,
        },
    }
}

function bounceBorders(
    pos: Vector2,
    angle: number,
    worldSize: Vector2
): { position: Vector2; angle: number } {
    let { x, y } = pos;
    let a = angle;

    if (x < 0 || x > worldSize.x) {
        a = Math.PI - a
        x = Math.max(0, Math.min(worldSize.x, x))
    }
    if (y < 0 || y > worldSize.y) {
        a = -a
        y = Math.max(0, Math.min(worldSize.y, y))
    }

    return { position: { x, y }, angle: a }
}

function distance(a: Vector2, b: Vector2) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export interface AntGraphic {
    container: PIXI.Container
    sprite: PIXI.Sprite
    frames: PIXI.Texture[]
    isReturning: boolean
}

const cachedTexturesMap = new Map<string, PIXI.Texture[]>()

function getFrames(sheetPath: string): PIXI.Texture[] {
    if (cachedTexturesMap.has(sheetPath)) return cachedTexturesMap.get(sheetPath)!

    const base = PIXI.Texture.from(sheetPath)
    const frames: PIXI.Texture[] = []

    for (let col = 0; col < SPRITE_COLS; col++) {
        const rect = new PIXI.Rectangle(col * FRAME_W, 0, FRAME_W, FRAME_H)
        frames.push(new PIXI.Texture({ source: base.source, frame: rect }))
    }

    cachedTexturesMap.set(sheetPath, frames)
    return frames
}

export function createAntGraphic(isReturning: boolean): AntGraphic {
    const container = new PIXI.Container()

    // Escolhe um sprite aleatório
    const sheetPath = SPRITE_SHEETS[Math.floor(Math.random() * SPRITE_SHEETS.length)]
    const frames    = getFrames(sheetPath)

    const sprite = new PIXI.Sprite(frames[0])
    sprite.anchor.set(0.5, 0.5)
    sprite.scale.set(0.5)

    if (isReturning) sprite.tint = 0xe74c3c

    container.addChild(sprite)
    return { container, sprite, frames, isReturning }
}

function buildBody(isReturning: boolean): PIXI.Graphics {
    const g = new PIXI.Graphics()

    const bodyColor    = isReturning ? 0xc0392b : 0xe8e8e8
    const strokeColor = isReturning ? 0x238636 : 0x30363d
    const antennaColor = isReturning ? 0x2ea043 : 0x484f58

    g.ellipse(-7, 0, 5, 3.5)
    g.fill({ color: bodyColor, alpha: 0.9 })
    g.setStrokeStyle({ width: 0.4, color: strokeColor })
    g.stroke()

    g.ellipse(0, 0, 3, 2)
    g.fill({ color: bodyColor, alpha: 0.95 })
    g.setStrokeStyle({ width: 0.4, color: strokeColor })
    g.stroke()

    g.circle(6, 0, 2.5)
    g.fill({ color: bodyColor })
    g.setStrokeStyle({ width: 0.4, color: strokeColor })
    g.stroke()

    g.setStrokeStyle({ width: 0.5, color: antennaColor, alpha: 0.6 })
    g.moveTo(7.5, -0.5); g.lineTo(11, -4.5); g.stroke()
    g.moveTo(7.5, -0.5); g.lineTo(12, -0.5); g.stroke()

    g.circle(7, -1, 0.6)
    g.fill({ color: 0xc9d1d9, alpha: 0.8 })

    if (isReturning) {
        g.circle(-13, 0, 3.5)
        g.fill({ color: 0x238636, alpha: 0.9 })
        g.setStrokeStyle({ width: 0.4, color: 0x3fb950, alpha: 0.7 })
        g.stroke()
    }

    return g
}

export function updateAntLegs(graphic: AntGraphic, phase: number): void {
    const frameIndex = Math.floor((phase / (Math.PI * 2)) * TOTAL_FRAMES) % TOTAL_FRAMES
    graphic.sprite.texture = graphic.frames[frameIndex]
}