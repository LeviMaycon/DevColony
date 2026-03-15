'use client'

import dynamic from 'next/dynamic'

const SearchBar = dynamic(() => import('./SearchBar'), { ssr: false })

export default function SearchBarWrapper() {
    return <div className="w-full max-w-271"><SearchBar /></div>
}