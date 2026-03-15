import { useState } from 'react'
import { FoodSource } from '../simulation/types'
import { generatePositions } from '../simulation/placement'

interface GitHubRepo {
    id: string
    repoName: string
    repoUrl: string
    repoStars: number
    repoLanguage: string
    repoOwner: string
    repoOwnerAvatar: string
    repoCreatedAt: string
    description: string
}

export function useGitHubSearch() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function search(query: string): Promise<FoodSource[]> {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/github/search?q=${encodeURIComponent(query)}`)
            if (!res.ok) throw new Error('Falha na busca')

            const data = await res.json()
            const repos = data.repos as GitHubRepo[]
            const positions = generatePositions(repos.length, window.innerWidth, window.innerHeight)

            return repos.map((repo, i) => ({
                id: repo.id,
                position: positions[i],
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
            }))
        } catch (e) {
            setError('Erro ao buscar repositórios')
            return []
        } finally {
            setLoading(false)
        }
    }

    return { search, loading, error }
}