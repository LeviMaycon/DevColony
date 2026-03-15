import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q')
    if (!query) return NextResponse.json({ error: 'query obrigatória' }, { status: 400 })

    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=50`

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
        },
    })

    if (!res.ok) {
        return NextResponse.json({ error: 'Erro na API do GitHub' }, { status: res.status })
    }

    const data = await res.json()

    // retorna apenas o necessario
    const repos = data.items.map((item: any) => ({
        id: String(item.id),
        repoName: item.full_name,
        repoUrl: item.html_url,
        repoStars: item.stargazers_count,
        repoLanguage: item.language ?? 'Unknown',
        description: item.description ?? '',
    }))

    return NextResponse.json({ repos })
}