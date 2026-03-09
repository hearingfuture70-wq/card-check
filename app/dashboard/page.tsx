"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

/* TRANSACTION LOGGER */

function logTransaction(username:string,type:string,amount:number,description:string){

const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")

transactions.unshift({
id: Date.now(),
username,
type,
amount,
description,
date: new Date().toLocaleString()
})

localStorage.setItem("transactions", JSON.stringify(transactions))

}

export default function Dashboard(){

const router = useRouter()

const [card,setCard] = useState("")
const [expiry,setExpiry] = useState("")
const [cvc,setCvc] = useState("")
const [country,setCountry] = useState("")
const [bin,setBin] = useState("")
const [result,setResult] = useState<any>(null)
const [balance,setBalance] = useState<string | null>(null)
const [binResult,setBinResult] = useState<any>(null)
const [credits,setCredits] = useState(0)

const [rechargeAmount,setRechargeAmount] = useState("")

/* AUTO CREDIT SYNC */

useEffect(()=>{

function loadCredits(){

const user = JSON.parse(localStorage.getItem("currentUser") || "{}")

if(user){
setCredits(user.credits || 0)
}

}

loadCredits()

const interval = setInterval(loadCredits,1000)

return ()=>clearInterval(interval)

},[])

/* RECHARGE REQUEST */

function requestRecharge(){

const user = JSON.parse(localStorage.getItem("currentUser") || "{}")

if(!rechargeAmount){
alert("Enter recharge amount")
return
}

const requests = JSON.parse(localStorage.getItem("rechargeRequests") || "[]")

requests.unshift({
id: Date.now(),
username: user.username,
amount: Number(rechargeAmount),
status: "pending",
date: new Date().toLocaleString()
})

localStorage.setItem("rechargeRequests", JSON.stringify(requests))

alert("Recharge request sent to admin")

setRechargeAmount("")

}

function logout(){
router.push("/login")
}

function getCardLogo(type:string){

if(type === "Visa")
return "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"

if(type === "Mastercard")
return "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"

if(type === "American Express")
return "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"

return null

}

function formatExpiry(value:string){

let cleaned = value.replace(/\D/g,"")
cleaned = cleaned.substring(0,4)

if(cleaned.length >= 3){
return cleaned.substring(0,2) + "/" + cleaned.substring(2)
}

return cleaned

}

/* DISABLED CARD CHECK */

function handleCheck(){

alert(
"Service Temporarily Unavailable\n\nThe card verification API is currently not connected to the banking network.\n\nAccess to card validation services requires authorized banking integration. Please contact your financial institution or system administrator to obtain API access credentials."
)

return

}

/* DISABLED BIN CHECK */

function handleBinCheck(){

alert(
"BIN Verification Restricted\n\nThe BIN lookup service is currently unavailable.\n\nThis feature requires a secure banking API connection. Please contact your bank or system administrator to enable BIN verification services."
)

return

}

function handleCardChange(value:string){

setCard(value)
setBalance(null)
setResult(null)

}

return(

<div className="flex min-h-screen bg-gray-900 text-white">

{/* SIDEBAR */}

<div className="w-64 bg-gray-800 p-6 flex flex-col justify-between">

<div>

<h1 className="text-xl font-bold mb-8">
Fintech Panel
</h1>

<ul className="space-y-4">
<li className="hover:text-blue-400 cursor-pointer">Dashboard</li>
<li className="hover:text-blue-400 cursor-pointer">Card Checker</li>
<li className="hover:text-blue-400 cursor-pointer">BIN Validator</li>
<li className="hover:text-blue-400 cursor-pointer">Countries</li>
</ul>

{/* RECHARGE */}

<div className="mt-8">

<h2 className="text-sm font-semibold mb-2">
Recharge Credits
</h2>

<input
placeholder="Enter credits"
value={rechargeAmount}
onChange={(e)=>setRechargeAmount(e.target.value)}
className="w-full p-2 mb-2 bg-gray-700 rounded"
/>

<button
onClick={requestRecharge}
className="w-full bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded font-semibold"
>
Request Recharge
</button>

</div>

</div>

<button
onClick={logout}
className="bg-red-600 hover:bg-red-700 p-3 rounded font-semibold w-full"
>
Logout
</button>

</div>

{/* MAIN */}

<div className="flex-1 p-10">

<div className="flex justify-between items-center mb-10">

<h1 className="text-3xl font-bold">
Card Inquiry Dashboard
</h1>

<div className="flex items-center gap-3">

<div className="bg-gray-800 px-4 py-2 rounded text-green-400 font-bold">
Credits: {credits}
</div>

<img
src="https://i.pravatar.cc/40"
className="w-10 h-10 rounded-full"
/>

</div>

</div>

<div className="grid grid-cols-2 gap-8">

{/* CARD CHECKER */}

<div className="bg-gray-800 p-6 rounded-lg">

<h2 className="text-lg font-semibold mb-4">
Card Checker
</h2>

<input
type="text"
placeholder="Card Number"
value={card}
className="w-full p-3 rounded bg-gray-700 mb-4 outline-none"
onChange={(e)=>handleCardChange(e.target.value)}
/>

<div className="grid grid-cols-2 gap-4 mb-4">

<input
type="text"
placeholder="MM/YY"
value={expiry}
maxLength={5}
className="p-3 rounded bg-gray-700 outline-none"
onChange={(e)=>setExpiry(formatExpiry(e.target.value))}
/>

<input
type="text"
placeholder="CVC"
value={cvc}
maxLength={4}
className="p-3 rounded bg-gray-700 outline-none"
onChange={(e)=>setCvc(e.target.value.replace(/\D/g,''))}
/>

</div>

<select
className="w-full p-3 rounded bg-gray-700 mb-4"
onChange={(e)=>setCountry(e.target.value)}
>
<option>Select Country</option>
<option>United States</option>
<option>United Kingdom</option>
<option>Canada</option>
<option>Germany</option>
<option>Australia</option>
</select>

<button
onClick={handleCheck}
className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
>
Check Card
</button>

</div>

{/* BIN VALIDATOR */}

<div className="bg-gray-800 p-6 rounded-lg">

<h2 className="text-lg font-semibold mb-4">
BIN Validator
</h2>

<input
type="text"
placeholder="Enter BIN Number"
value={bin}
maxLength={6}
className="w-full p-3 rounded bg-gray-700 mb-4"
onChange={(e)=>setBin(e.target.value.replace(/\D/g,''))}
/>

<button
onClick={handleBinCheck}
className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-semibold"
>
Check BIN
</button>

</div>

</div>

</div>

</div>

)

}