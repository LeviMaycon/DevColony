'use client'

import dynamic from 'next/dynamic'

const RepoHoverCard = dynamic(() => import('./RepoHoverCard'), { ssr: false })

export default function RepoHoverCardWrapper() {
    return <RepoHoverCard />
}