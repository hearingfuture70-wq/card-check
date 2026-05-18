"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [card, setCard] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [country, setCountry] = useState("")
  const [bin, setBin] = useState("")
  const [credits, setCredits] = useState(0)
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [showPlans, setShowPlans] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ✅ FETCH CREDITS FROM DATABASE
  useEffect(() => {
    const auth = localStorage.getItem("userAuth")
    if (!auth) {
      router.push("/")
      return
    }

    const savedUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    setCurrentUser(savedUser)

    async function fetchCredits() {
      try {
        const res = await fetch("/api/users")
        const data = await res.json()
        if (data.success) {
          const found = data.users.find(
            (u: any) => u.username === savedUser.username
          )
          if (found) {
            setCredits(found.credits || 0)
          }
        }
      } catch (err) {
        console.error("Failed to fetch credits")
      }
    }

    fetchCredits()
    // ✅ Refresh credits every 5 seconds automatically
    const interval = setInterval(fetchCredits, 5000)
    return () => clearInterval(interval)
  }, [])

  function requestRecharge() {
    if (!rechargeAmount) {
      alert("Enter recharge amount")
      return
    }
    alert("Recharge request sent to admin!")
    setRechargeAmount("")
  }

  function formatExpiry(value: string) {
    let cleaned = value.replace(/\D/g, "")
    cleaned = cleaned.substring(0, 4)
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2)
    }
    return cleaned
  }

  function handleCheck() {
    alert(
      "Service Temporarily Unavailable\n\nThe card verification API is currently not connected to the banking network.\n\nAccess to card validation services requires authorized banking integration."
    )
  }

  function handleBinCheck() {
    alert(
      "BIN Verification Restricted\n\nThe BIN lookup service is currently unavailable.\n\nThis feature requires a secure banking API connection."
    )
  }

  function logout() {
    localStorage.removeItem("userAuth")
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold mb-8">Card Checker</h1>
          <ul className="space-y-4">
            <li className="hover:text-blue-400 cursor-pointer">Dashboard</li>
            <li className="hover:text-blue-400 cursor-pointer">Card Checker</li>
            <li className="hover:text-blue-400 cursor-pointer">BIN Validator</li>
            <li className="hover:text-blue-400 cursor-pointer">Countries</li>
            <li
              onClick={() => setShowPlans(true)}
              className="hover:text-yellow-400 cursor-pointer"
            >
              Plans / Tariffs
            </li>
          </ul>

          {/* RECHARGE */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Recharge Credits</h2>
            <input
              placeholder="Enter credits"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
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

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Card Inquiry Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* ✅ CREDITS FROM DATABASE */}
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
            <h2 className="text-lg font-semibold mb-4">Card Checker</h2>
            <input
              type="text"
              placeholder="Card Number"
              value={card}
              className="w-full p-3 rounded bg-gray-700 mb-4 outline-none"
              onChange={(e) => setCard(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                maxLength={5}
                className="p-3 rounded bg-gray-700 outline-none"
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />
              <input
                type="text"
                placeholder="CVC"
                value={cvc}
                maxLength={4}
                className="p-3 rounded bg-gray-700 outline-none"
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <select
              className="w-full p-3 rounded bg-gray-700 mb-4"
              onChange={(e) => setCountry(e.target.value)}
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
            <h2 className="text-lg font-semibold mb-4">BIN Validator</h2>
            <input
              type="text"
              placeholder="Enter BIN Number"
              value={bin}
              maxLength={6}
              className="w-full p-3 rounded bg-gray-700 mb-4"
              onChange={(e) => setBin(e.target.value.replace(/\D/g, ""))}
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

      {/* PLANS POPUP */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg w-[420px]">
            <h2 className="text-xl font-bold mb-6 text-center">
              Credit Tariffs
            </h2>
            <div className="space-y-2 text-center text-gray-200">
              <p>1 Credit = $1</p>
              <p>100 Credits = $25</p>
              <p>250 Credits = $50</p>
              <p>500 Credits = $100</p>
              <p>1000 Credits = $200</p>
              <p>5000 Credits = $500</p>
              <p>10000 Credits = $1000</p>
              <p>50000 Credits = $5000</p>
            </div>
            <button
              onClick={() => setShowPlans(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
