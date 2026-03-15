import { NextResponse } from 'next/server'

async function avatarToBase64(url: string): Promise<string | null> {
    try {
        const res = await fetch(url + '&s=64')
        if (!res.ok) return null
        const buffer = await res.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mime = res.headers.get('Content-Type') ?? 'image/png'
        return `data:${mime};base64,${base64}`
    } catch {
        return null
    }
}

export async function GET() {
    const since = new Date()
    since.setDate(since.getDate() - 7)
    const dateStr = since.toISOString().split('T')[0]

    const url = `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=100`

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
        },
    })

    if (!res.ok) return NextResponse.json({ error: 'Erro na API do GitHub' }, { status: res.status })

    const data = await res.json()

    const repos = await Promise.all(
        data.items.map(async (item: any) => ({
            id: String(item.id),
            repoName: item.full_name,
            repoUrl: item.html_url,
            repoStars: item.stargazers_count,
            repoLanguage: item.language ?? null,
            repoOwner: item.owner?.login ?? null,
            repoOwnerAvatar: await avatarToBase64(item.owner?.avatar_url ?? ''),
            repoCreatedAt: item.created_at ? new Date(item.created_at).getFullYear() : null,
            description: item.description ?? null,
        }))
    )

    return NextResponse.json({ repos })
}