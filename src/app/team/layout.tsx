import { ReactNode } from 'react'

interface TeamLayoutProps {
  children: ReactNode
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Conteúdo principal sem header */}
      <div>
        {children}
      </div>
    </div>
  )
}