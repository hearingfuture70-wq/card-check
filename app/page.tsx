"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  async function login() {
    // ADMIN LOGIN
    if (
      username.trim() === "admin" &&
      password.trim() === "admin123"
    ) {
      localStorage.setItem("adminAuth", "true")
      router.push("/admin/dashboard")
      return
    }

    try {
      // API LOGIN
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("userAuth", "true")
        localStorage.setItem("currentUser", JSON.stringify(data.user)) // ✅ FIXED
        router.push("/dashboard")
      } else {
        alert("Invalid username or password")
      }
    } catch (error) {
      alert("Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded w-80">
        <h1 className="text-xl mb-4">
          Checker Login
        </h1>
        <input
          value={username}
          placeholder="Username"
          className="w-full p-3 mb-3 bg-gray-700 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          value={password}
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-3 bg-gray-700 rounded"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />
        <button
          onClick={login}
          className="w-full bg-blue-600 p-3 rounded"
        >
          Login
        </button>
      </div>
    </div>
  )
}
