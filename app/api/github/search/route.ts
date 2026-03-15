import { NextRequest, NextResponse } from 'next/server'

async function avatarToBase64(url: string): Promise<string | null> {
    try {
        const res = await fetch(url + '&s=64')
        if (!res.ok) return null
        const buffer = await res.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mime = res.headers.get('Content-Type') ?? 'image/png'
        return `data:${mime};base64,${base64}`
    } catch { return null }
}

async function fetchOwnerProfile(login: string, token: string) {
    try {
        const res = await fetch(`https://api.github.com/users/${login}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
        })
        if (!res.ok) return null
        const data = await res.json()
        return {
            bio: data.bio ?? null,
            location: data.location ?? null,
            publicRepos: data.public_repos ?? null,
        }
    } catch { return null }
}

async function fetchLastCommit(fullName: string, token: string): Promise<string | null> {
    try {
        const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=1`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
        })
        if (!res.ok) return null
        const data = await res.json()
        return data[0]?.commit?.committer?.date ?? null
    } catch { return null }
}

async function fetchReadme(fullName: string, token: string): Promise<string | null> {
    try {
        const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
        })
        if (!res.ok) return null
        const data = await res.json()
        const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
        // Retorna só as primeiras 500 chars para não pesar
        return decoded.slice(0, 500)
    } catch { return null }
}

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q')
    const year = req.nextUrl.searchParams.get('year')

    if (!query) return NextResponse.json({ error: 'query obrigatória' }, { status: 400 })

    const token = process.env.GITHUB_TOKEN ?? ''
    let q = encodeURIComponent(query)
    if (year) q += encodeURIComponent(` created:${year}-01-01..${year}-12-31`)

    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&per_page=100`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    })

    if (!res.ok) return NextResponse.json({ error: 'Erro na API do GitHub' }, { status: res.status })

    const data = await res.json()

    const repos = await Promise.all(
        data.items.map(async (item: any) => {
            const [avatar, owner, lastCommit, readme] = await Promise.all([
                avatarToBase64(item.owner?.avatar_url ?? ''),
                fetchOwnerProfile(item.owner?.login ?? '', token),
                fetchLastCommit(item.full_name, token),
                fetchReadme(item.full_name, token),
            ])

            return {
                id: String(item.id),
                repoName: item.full_name,
                repoUrl: item.html_url,
                repoStars: item.stargazers_count,
                repoLanguage: item.language ?? null,
                repoOwner: item.owner?.login ?? null,
                repoOwnerAvatar: avatar,
                repoOwnerBio: owner?.bio ?? null,
                repoOwnerLocation: owner?.location ?? null,
                repoOwnerRepos: owner?.publicRepos ?? null,
                repoCreatedAt: item.created_at ? new Date(item.created_at).getFullYear() : null,
                description: item.description ?? null,
                repoForks: item.forks_count ?? null,
                repoWatchers: item.watchers_count ?? null,
                repoOpenIssues: item.open_issues_count ?? null,
                repoLastCommit: lastCommit,
                repoReadme: readme,
            }
        })
    )

    return NextResponse.json({ repos })
}