"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin(){

const router = useRouter()

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")

function login(){

if(username === "admin" && password === "admin123"){

localStorage.setItem("adminAuth","true")

router.push("/admin/dashboard")

}else{

alert("Wrong admin login")

}

}

return(

<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">

<div className="bg-gray-800 p-8 rounded w-96">

<h1 className="text-2xl mb-6 font-bold">
Admin Login
</h1>

<input
placeholder="Admin Username"
className="w-full p-3 mb-3 bg-gray-700 rounded"
onChange={(e)=>setUsername(e.target.value)}
/>

<input
type="password"
placeholder="Admin Password"
className="w-full p-3 mb-4 bg-gray-700 rounded"
onChange={(e)=>setPassword(e.target.value)}
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
