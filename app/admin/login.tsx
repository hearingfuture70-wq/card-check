"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin(){

  const router = useRouter()

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")

  async function handleLogin(){

    // ✅ Admin login
    if(username === "admin" && password === "admin123"){
      localStorage.setItem("adminAuth","true")
      router.push("/admin")
      return
    }

    // ✅ User login (from database)
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",   // 🔥 THIS WAS MISSING
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if(data.success){
      localStorage.setItem("userAuth","true")
      router.push("/dashboard")
    }else{
      alert("Invalid username or password")
    }
  }

  return(

    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">

      <div className="bg-gray-800 p-8 rounded-lg w-96">

        <h1 className="text-2xl font-bold mb-6">
          Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 rounded bg-gray-700"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-gray-700"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
        >
          Login
        </button>

      </div>

    </div>

  )
}
