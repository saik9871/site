'use client'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigation Cards */}
        <Link href="/dashboard/admin/stocks" className="card hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-2">Stock Management</h2>
          <p className="text-gray-400">Manage stocks, prices, and supply</p>
        </Link>

        <Link href="/dashboard/admin/users" className="card hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-400">Manage users, balances, and permissions</p>
        </Link>

        <Link href="/dashboard/admin/predictions" className="card hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-2">Predictions</h2>
          <p className="text-gray-400">Manage market predictions</p>
        </Link>

        <Link href="/dashboard/admin/analytics" className="card hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-400">View platform statistics</p>
        </Link>
      </div>
    </div>
  )
}
