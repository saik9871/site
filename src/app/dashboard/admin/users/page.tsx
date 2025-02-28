'use client'
import { useState, useEffect } from 'react'

interface User {
  id: number
  username: string
  balance: string | number
  role: string
  created_at: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    }
  }

  const handleUpdateUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })

      if (response.ok) {
        setEditingUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const formatBalance = (balance: string | number): string => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance
    return numBalance.toFixed(2)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4">Username</th>
              <th className="text-left p-4">Balance</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Joined</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-[var(--border)]">
                <td className="p-4">{user.username}</td>
                <td className="p-4">${formatBalance(user.balance)}</td>
                <td className="p-4">{user.role || 'user'}</td>
                <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="btn mr-2"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editingUser.username}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, username: e.target.value }))}
                className="input w-full"
                placeholder="Username"
              />
              <input
                type="number"
                value={typeof editingUser.balance === 'string' ? parseFloat(editingUser.balance) : editingUser.balance}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, balance: parseFloat(e.target.value) }))}
                className="input w-full"
                placeholder="Balance"
                step="0.01"
              />
              <select
                value={editingUser.role || 'user'}
                onChange={(e) => setEditingUser(prev => ({ ...prev!, role: e.target.value }))}
                className="input w-full"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateUser(editingUser)}
                  className="btn flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="btn flex-1 bg-red-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
