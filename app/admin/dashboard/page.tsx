"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard(){
  const router = useRouter()
  const [page, setPage] = useState("users")
  const [users, setUsers] = useState<any[]>([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [backupProxy, setBackupProxy] = useState("")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (!auth) { router.push("/admin"); return }
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (data.success) setUsers(data.users)
      else alert("Error fetching users: " + data.error)
    } catch { alert("Failed to fetch users") }
  }

  async function createUser() {
    if (!username || !password) { alert("Enter username and password"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      })
      const data = await res.json()
      if (data.success) {
        alert("User created!")
        setUsername(""); setPassword(""); setRole("user")
        fetchUsers()
      } else alert("Error: " + data.error)
    } catch { alert("Failed to create user") }
    setLoading(false)
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user?")) return
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) fetchUsers()
      else alert("Error: " + data.error)
    } catch { alert("Failed to delete user") }
  }

  // ✅ BULK DELETE
  async function deleteSelected() {
    if (selectedIds.length === 0) { alert("No users selected"); return }
    if (!confirm(`Delete ${selectedIds.length} selected users?`)) return
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/users?id=${id}`, { method: "DELETE" })
        )
      )
      setSelectedIds([])
      fetchUsers()
    } catch { alert("Failed to delete selected users") }
  }

  async function rechargeUser(id: number) {
    const amount = prompt("Enter credits to add")
    if (!amount) return
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, credits: Number(amount) }),
      })
      const data = await res.json()
      if (data.success) fetchUsers()
      else alert("Error: " + data.error)
    } catch { alert("Failed to recharge user") }
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id))
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function logout() {
    localStorage.removeItem("adminAuth")
    router.push("/admin")
  }

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  const allSelected = filteredUsers.length > 0 && selectedIds.length === filteredUsers.length

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
          <ul className="space-y-4">
            <li onClick={() => setPage("dashboard")} className="hover:text-blue-400 cursor-pointer">Dashboard</li>
            <li onClick={() => setPage("users")} className="hover:text-blue-400 cursor-pointer">Users</li>
            <li onClick={() => setPage("wallet")} className="hover:text-blue-400 cursor-pointer">Wallet Connected</li>
            <li onClick={() => setPage("backup")} className="hover:text-blue-400 cursor-pointer">Backup API Proxy</li>
          </ul>
        </div>
        <button onClick={logout} className="bg-red-600 p-3 rounded font-semibold">Logout</button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded">
                <p className="text-gray-400">Total Users</p>
                <h2 className="text-3xl font-bold">{users.length}</h2>
              </div>
              <div className="bg-gray-800 p-6 rounded">
                <p className="text-gray-400">Admins</p>
                <h2 className="text-3xl font-bold">{users.filter(u => u.role === "admin").length}</h2>
              </div>
              <div className="bg-gray-800 p-6 rounded">
                <p className="text-gray-400">Regular Users</p>
                <h2 className="text-3xl font-bold">{users.filter(u => u.role === "user").length}</h2>
              </div>
            </div>
          </div>
        )}

        {/* USER MANAGEMENT */}
        {page === "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>

            {/* CREATE USER FORM */}
            <div className="bg-gray-800 p-6 rounded-lg w-96 mb-10">
              <h2 className="mb-4 font-semibold">Create User</h2>
              <input placeholder="Username" value={username}
                className="w-full p-3 mb-3 bg-gray-700 rounded"
                onChange={(e) => setUsername(e.target.value)} />
              <input placeholder="Password" value={password}
                className="w-full p-3 mb-3 bg-gray-700 rounded"
                onChange={(e) => setPassword(e.target.value)} />
              <select value={role}
                className="w-full p-3 mb-4 bg-gray-700 rounded"
                onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={createUser} disabled={loading}
                className="w-full bg-blue-600 p-3 rounded disabled:opacity-50">
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>

            {/* USERS TABLE */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">Users</h2>
                  {/* ✅ BULK DELETE BUTTON */}
                  {selectedIds.length > 0 && (
                    <button onClick={deleteSelected}
                      className="bg-red-600 px-4 py-2 rounded text-sm font-semibold">
                      🗑 Delete Selected ({selectedIds.length})
                    </button>
                  )}
                </div>
                <input placeholder="Search user..."
                  className="p-2 bg-gray-700 rounded"
                  onChange={(e) => setSearch(e.target.value)} />
              </div>

              <table className="w-full text-left">
                <thead className="border-b border-gray-700">
                  <tr>
                    {/* ✅ SELECT ALL CHECKBOX */}
                    <th className="p-2">
                      <input type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer accent-red-500" />
                    </th>
                    <th className="p-2">Username</th>
                    <th className="p-2">Password</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Credits</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`border-b border-gray-700 ${selectedIds.includes(u.id) ? "bg-gray-700" : ""}`}>
                      {/* ✅ ROW CHECKBOX */}
                      <td className="p-2">
                        <input type="checkbox"
                          checked={selectedIds.includes(u.id)}
                          onChange={() => toggleSelect(u.id)}
                          className="w-4 h-4 cursor-pointer accent-red-500" />
                      </td>
                      <td className="p-2">{u.username}</td>
                      <td className="p-2 text-red-400">{u.password}</td>
                      <td className="p-2">
                        <span className={u.role === "admin" ? "text-yellow-400" : "text-blue-400"}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-2">{u.credits || 0}</td>
                      <td className="p-2 space-x-2">
                        <button onClick={() => rechargeUser(u.id)}
                          className="bg-green-600 px-3 py-1 rounded text-sm">Recharge</button>
                        <button onClick={() => deleteUser(u.id)}
                          className="bg-red-600 px-3 py-1 rounded text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="text-center text-gray-400 mt-4">No users found</p>
              )}
            </div>
          </div>
        )}

        {/* WALLET */}
        {page === "wallet" && (
          <div className="bg-gray-800 p-8 rounded-lg w-[420px]">
            <h2 className="text-xl font-bold mb-4">Wallet Connected</h2>
            <img src="/wallet-qr.png" className="w-72 mx-auto rounded" />
            <p className="text-center text-gray-400 mt-4">TRC20 USDT Wallet</p>
          </div>
        )}

        {/* BACKUP PROXY */}
        {page === "backup" && (
          <div className="bg-gray-800 p-8 rounded-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">Backup API Proxy</h2>
            <input placeholder="https://your-backup-api.com" value={backupProxy}
              onChange={(e) => setBackupProxy(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded" />
            <button onClick={() => { localStorage.setItem("backupProxy", backupProxy); alert("Saved!") }}
              className="w-full bg-blue-600 p-3 rounded">Save Proxy</button>
          </div>
        )}
      </div>
    </div>
  )
}
