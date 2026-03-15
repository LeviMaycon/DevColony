import * as PIXI from 'pixi.js'

interface CameraState {
    x: number
    y: number
    zoom: number
}

const MIN_ZOOM = 0.2
const MAX_ZOOM = 3
const ZOOM_SPEED = 0.001

export function setupCamera(
    app: PIXI.Application,
    world: PIXI.Container
): () => void {
    const state: CameraState = { x: 0, y: 0, zoom: 1 }
    let dragging = false
    let lastX = 0
    let lastY = 0

    function applyTransform() {
        world.scale.set(state.zoom)
        world.x = state.x
        world.y = state.y
    }

    function onWheel(e: WheelEvent) {
        e.preventDefault()

        const oldZoom = state.zoom
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom - e.deltaY * ZOOM_SPEED * oldZoom))

        // Zoom centrado no cursor
        const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        state.x = mouseX - (mouseX - state.x) * (newZoom / oldZoom)
        state.y = mouseY - (mouseY - state.y) * (newZoom / oldZoom)
        state.zoom = newZoom

        applyTransform()
    }

    function onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return
        dragging = true
        lastX = e.clientX
        lastY = e.clientY
            ; (app.canvas as HTMLCanvasElement).style.cursor = 'grabbing'
    }

    function onMouseMove(e: MouseEvent) {
        if (!dragging) return
        state.x += e.clientX - lastX
        state.y += e.clientY - lastY
        lastX = e.clientX
        lastY = e.clientY
        applyTransform()
    }

    function onMouseUp() {
        dragging = false
            ; (app.canvas as HTMLCanvasElement).style.cursor = 'grab'
    }

    const canvas = app.canvas as HTMLCanvasElement
    canvas.style.cursor = 'grab'
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
        canvas.removeEventListener('wheel', onWheel)
        canvas.removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
    }
}