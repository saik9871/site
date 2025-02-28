'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Sidebar */}
      <aside className="w-64 card border-r border-[var(--border)]">
        <div className="flex flex-col h-full">
          <div className="p-[var(--card-padding)] border-b border-[var(--border)]">
            <motion.h1 
              className="text-2xl font-bold text-[var(--accent)]"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              WEENSTOCKS
            </motion.h1>
          </div>
          
          {/* Balance Display */}
          <div className="p-[var(--card-padding)] border-b border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">Balance</p>
            <p className="text-xl font-bold text-[var(--accent)]">$500.00</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-[var(--card-padding)]">
            <ul className="space-y-2">
              {[
                { href: "/dashboard", label: "Profile" },
                { href: "/dashboard/market", label: "Market" },
                { href: "/dashboard/predictions", label: "Predictions" },
                { href: "/dashboard/leaderboard", label: "Leaderboard" },
                { href: "/dashboard/admin", label: "Admin Panel" }
              ].map((link) => (
                <motion.li key={link.href} whileHover={{ x: 5 }}>
                  <Link href={link.href} className="nav-link">
                    <span>{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-[var(--card-padding)] border-t border-[var(--border)]">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn bg-red-500/10 text-red-500 hover:bg-red-500/20"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-[var(--container-padding)]">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fade-in"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
