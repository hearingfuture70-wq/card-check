"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard(){

const router = useRouter()

const [users,setUsers] = useState<any[]>([])
const [transactions,setTransactions] = useState<any[]>([])
const [requests,setRequests] = useState<any[]>([])

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [role,setRole] = useState("user")
const [search,setSearch] = useState("")
const [totalCardsChecked,setTotalCardsChecked] = useState(0)

useEffect(()=>{

const auth = localStorage.getItem("adminAuth")

if(!auth){
router.push("/admin")
}

const savedUsers = localStorage.getItem("users")
const cardStats = localStorage.getItem("cardsChecked")
const savedTransactions = localStorage.getItem("transactions")
const savedRequests = localStorage.getItem("rechargeRequests")

if(savedUsers){
setUsers(JSON.parse(savedUsers))
}

if(cardStats){
setTotalCardsChecked(Number(cardStats))
}

if(savedTransactions){
setTransactions(JSON.parse(savedTransactions))
}

if(savedRequests){
setRequests(JSON.parse(savedRequests))
}

},[])

function saveUsers(updated:any){

setUsers(updated)
localStorage.setItem("users",JSON.stringify(updated))

}

/* CREATE USER */

function createUser(){

if(!username || !password){
alert("Enter username and password")
return
}

const newUser = {
id:Date.now(),
username,
password,
role,
credits:0
}

const updated = [...users,newUser]

saveUsers(updated)

setUsername("")
setPassword("")
setRole("user")

}

/* DELETE USER */

function deleteUser(id:number){

const updated = users.filter((u)=>u.id !== id)

saveUsers(updated)

}

/* MANUAL RECHARGE */

function rechargeUser(id:number){

const amount = prompt("Enter credits to add")

if(!amount) return

const updated = users.map((u)=>{

if(u.id === id){

return {
...u,
credits:(u.credits || 0) + Number(amount)
}

}

return u

})

saveUsers(updated)

}

/* APPROVE RECHARGE REQUEST */

function approveRequest(req:any){

const updatedUsers = users.map((u)=>{

if(u.username === req.username){

return {
...u,
credits:(u.credits || 0) + Number(req.amount)
}

}

return u

})

setUsers(updatedUsers)
localStorage.setItem("users",JSON.stringify(updatedUsers))

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

if(currentUser.username === req.username){

currentUser.credits = (currentUser.credits || 0) + Number(req.amount)

localStorage.setItem("currentUser",JSON.stringify(currentUser))

}

const updatedRequests = requests.map((r)=>{

if(r.id === req.id){
return {...r,status:"approved"}
}

return r

})

setRequests(updatedRequests)
localStorage.setItem("rechargeRequests",JSON.stringify(updatedRequests))

const newTx = {
id: Date.now(),
username:req.username,
type:"credit",
amount:req.amount,
description:"Recharge Approved",
date:new Date().toLocaleString()
}

const tx = [newTx,...transactions]

setTransactions(tx)
localStorage.setItem("transactions",JSON.stringify(tx))

}

/* LOGOUT */

function logout(){

localStorage.removeItem("adminAuth")
router.push("/admin")

}

const filteredUsers = users.filter((u)=>
u.username.toLowerCase().includes(search.toLowerCase())
)

return(

<div className="flex min-h-screen bg-gray-900 text-white">

<div className="w-64 bg-gray-800 p-6 flex flex-col justify-between">

<div>

<h1 className="text-xl font-bold mb-8">
Admin Panel
</h1>

<ul className="space-y-4">

<li className="hover:text-blue-400 cursor-pointer">
Dashboard
</li>

<li className="hover:text-blue-400 cursor-pointer">
Users
</li>

<li className="hover:text-blue-400 cursor-pointer">
Analytics
</li>

</ul>

</div>

<button
onClick={logout}
className="bg-red-600 p-3 rounded font-semibold"
>
Logout
</button>

</div>

<div className="flex-1 p-10">

<h1 className="text-3xl font-bold mb-8">
Admin Dashboard
</h1>

{/* ANALYTICS */}

<div className="grid grid-cols-3 gap-6 mb-10">

<div className="bg-gray-800 p-6 rounded">
<p className="text-gray-400">Total Users</p>
<h2 className="text-3xl font-bold">{users.length}</h2>
</div>

<div className="bg-gray-800 p-6 rounded">
<p className="text-gray-400">Total Cards Checked</p>
<h2 className="text-3xl font-bold">{totalCardsChecked}</h2>
</div>

<div className="bg-gray-800 p-6 rounded">
<p className="text-gray-400">Admins</p>
<h2 className="text-3xl font-bold">
{users.filter(u=>u.role==="admin").length}
</h2>
</div>

</div>

{/* CREATE USER */}

<div className="bg-gray-800 p-6 rounded-lg w-96 mb-10">

<h2 className="mb-4 font-semibold">
Create User
</h2>

<input
placeholder="Username"
value={username}
className="w-full p-3 mb-3 bg-gray-700 rounded"
onChange={(e)=>setUsername(e.target.value)}
/>

<input
placeholder="Password"
value={password}
className="w-full p-3 mb-3 bg-gray-700 rounded"
onChange={(e)=>setPassword(e.target.value)}
/>

<select
value={role}
className="w-full p-3 mb-4 bg-gray-700 rounded"
onChange={(e)=>setRole(e.target.value)}
>

<option value="user">User</option>
<option value="admin">Admin</option>

</select>

<button
onClick={createUser}
className="w-full bg-blue-600 p-3 rounded"
>
Create User
</button>

</div>

{/* USER MANAGEMENT */}

<div className="bg-gray-800 p-6 rounded-lg mb-10">

<div className="flex justify-between mb-4">

<h2 className="text-lg font-semibold">User Management</h2>

<input
placeholder="Search user..."
className="p-2 bg-gray-700 rounded"
onChange={(e)=>setSearch(e.target.value)}
/>

</div>

<table className="w-full text-left">

<thead className="border-b border-gray-700">

<tr>
<th className="p-2">Username</th>
<th className="p-2">Password</th>
<th className="p-2">Role</th>
<th className="p-2">Credits</th>
<th className="p-2">Action</th>
</tr>

</thead>

<tbody>

{filteredUsers.map((u)=> (

<tr key={u.id} className="border-b border-gray-700">

<td className="p-2">{u.username}</td>

<td className="p-2 text-red-400">
{u.password}
</td>

<td className="p-2">
<span className={u.role==="admin" ? "text-yellow-400" : "text-blue-400"}>
{u.role}
</span>
</td>

<td className="p-2">{u.credits || 0}</td>

<td className="p-2 space-x-2">

<button
onClick={()=>rechargeUser(u.id)}
className="bg-green-600 px-3 py-1 rounded"
>
Recharge
</button>

<button
onClick={()=>deleteUser(u.id)}
className="bg-red-600 px-3 py-1 rounded"
>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</div>

)

}