import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'url obrigatória' }, { status: 400 })

    const res = await fetch(url)
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': res.headers.get('Content-Type') ?? 'image/png',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
        },
    })
}