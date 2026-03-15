export function useShareSearch() {
    function share(query: string) {
        const url = new URL(window.location.href)
        url.searchParams.set('q', query)
        navigator.clipboard.writeText(url.toString())
        return url.toString()
    }

    function getQueryFromUrl(): string | null {
        if (typeof window === 'undefined') return null
        return new URLSearchParams(window.location.search).get('q')
    }

    return { share, getQueryFromUrl }
}