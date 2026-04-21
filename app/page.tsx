"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login(){

const router = useRouter()

const [user,setUser] = useState("")
const [pass,setPass] = useState("")

function login(){

/* ADMIN LOGIN */

if(user === "admin" && pass === "admin123"){

localStorage.setItem("adminAuth","true")
router.push("/admin/dashboard")
return

}

/* USER LOGIN */

const users = JSON.parse(localStorage.getItem("users") || "[]")

const foundUser = users.find(
(u:any)=>u.username === user && u.password === pass
)

if(!foundUser){

alert("Invalid username or password")
return

}

/* SAVE FULL USER OBJECT */

localStorage.setItem("currentUser", JSON.stringify(foundUser))

router.push("/dashboard")

}

return(

<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">

<div className="bg-gray-800 p-8 rounded w-80">

<h1 className="text-xl mb-4">
Checker Login
</h1>

<input
placeholder="Username"
className="w-full p-3 mb-3 bg-gray-700 rounded"
onChange={(e)=>setUser(e.target.value)}
/>

<input
type="password"
placeholder="Password"
className="w-full p-3 mb-3 bg-gray-700 rounded"
onChange={(e)=>setPass(e.target.value)}
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
