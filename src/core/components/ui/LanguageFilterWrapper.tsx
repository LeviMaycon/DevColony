'use client'

import dynamic from 'next/dynamic'

const LanguageFilter = dynamic(() => import('./LanguageFilterPanel'), { ssr: false })

export default function LanguageFilterWrapper() {
    return <LanguageFilter />
}