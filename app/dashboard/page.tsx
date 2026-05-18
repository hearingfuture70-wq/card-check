"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// ✅ REALISTIC DUMMY CARD CHECK
function checkCard(cardNumber: string, expiry: string, cvc: string, country: string) {
  const bins: any = {
    "4": { bank: "Chase Bank", type: "VISA", level: "Classic" },
    "51": { bank: "Citibank", type: "MASTERCARD", level: "Gold" },
    "52": { bank: "Bank of America", type: "MASTERCARD", level: "Platinum" },
    "53": { bank: "Wells Fargo", type: "MASTERCARD", level: "Classic" },
    "54": { bank: "Capital One", type: "MASTERCARD", level: "World" },
    "55": { bank: "HSBC Bank", type: "MASTERCARD", level: "Black" },
    "34": { bank: "American Express", type: "AMEX", level: "Gold" },
    "37": { bank: "American Express", type: "AMEX", level: "Platinum" },
    "6011": { bank: "Discover Bank", type: "DISCOVER", level: "Classic" },
  }

  const statuses = ["LIVE", "LIVE", "LIVE", "DEAD", "DEAD", "UNKNOWN"]
  const currencies = ["USD", "GBP", "EUR", "CAD", "AUD"]
  const balances = [
    "$1,250.00", "$3,780.50", "$542.20", "$12,000.00",
    "$890.75", "$4,321.00", "$7,654.32", "$230.10",
    "$15,000.00", "$2,100.80"
  ]

  let cardInfo = { bank: "Unknown Bank", type: "VISA", level: "Classic" }
  const prefix2 = cardNumber.substring(0, 2)
  const prefix4 = cardNumber.substring(0, 4)
  const prefix1 = cardNumber.substring(0, 1)

  if (bins[prefix4]) cardInfo = bins[prefix4]
  else if (bins[prefix2]) cardInfo = bins[prefix2]
  else if (bins[prefix1]) cardInfo = bins[prefix1]

  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const balance = balances[Math.floor(Math.random() * balances.length)]
  const currency = currencies[Math.floor(Math.random() * currencies.length)]
  const lastFour = cardNumber.slice(-4)

  return {
    status,
    cardNumber: `**** **** **** ${lastFour}`,
    expiry,
    type: cardInfo.type,
    bank: cardInfo.bank,
    level: cardInfo.level,
    balance: status === "LIVE" ? balance : "N/A",
    currency: status === "LIVE" ? currency : "N/A",
    country,
    checkedAt: new Date().toLocaleString(),
  }
}

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
  const [result, setResult] = useState<any>(null)
  const [binResult, setBinResult] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("userAuth")
    if (!auth) { router.push("/"); return }

    const savedUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    setCurrentUser(savedUser)

    async function fetchCredits() {
      try {
        const res = await fetch("/api/users")
        const data = await res.json()
        if (data.success) {
          const found = data.users.find((u: any) => u.username === savedUser.username)
          if (found) setCredits(found.credits || 0)
        }
      } catch (err) {}
    }

    fetchCredits()
    const interval = setInterval(fetchCredits, 5000)
    return () => clearInterval(interval)
  }, [])

  // ✅ CHECK CARD + DEDUCT 1 CREDIT
  async function handleCheck() {
    if (!card || card.length < 12) {
      alert("Enter a valid card number")
      return
    }
    if (!expiry) {
      alert("Enter expiry date")
      return
    }
    if (credits <= 0) {
      alert("❌ Insufficient credits! Please recharge.")
      return
    }

    setChecking(true)
    setResult(null)

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500))

    // ✅ DEDUCT 1 CREDIT FROM DATABASE
    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          credits: -1, // deduct 1
        }),
      })
      setCredits((prev) => prev - 1)
    } catch (err) {}

    // Show result
    const checkResult = checkCard(card, expiry, cvc, country)
    setResult(checkResult)
    setChecking(false)
  }

  // ✅ BIN CHECK
  async function handleBinCheck() {
    if (!bin || bin.length < 4) {
      alert("Enter at least 4 digits")
      return
    }

    const banks: any = {
      "4111": { bank: "Chase Bank", scheme: "VISA", type: "DEBIT", country: "United States" },
      "5200": { bank: "Bank of America", scheme: "MASTERCARD", type: "CREDIT", country: "United States" },
      "3714": { bank: "American Express", scheme: "AMEX", type: "CREDIT", country: "United States" },
      "6011": { bank: "Discover", scheme: "DISCOVER", type: "CREDIT", country: "United States" },
    }

    const schemes: any = {
      "4": { bank: "VISA Issuing Bank", scheme: "VISA", type: "CREDIT", country: "Unknown" },
      "5": { bank: "Mastercard Issuing Bank", scheme: "MASTERCARD", type: "CREDIT", country: "Unknown" },
      "3": { bank: "American Express", scheme: "AMEX", type: "CREDIT", country: "United States" },
      "6": { bank: "Discover Network", scheme: "DISCOVER", type: "DEBIT", country: "United States" },
    }

    const info = banks[bin.substring(0, 4)] ||
      schemes[bin.substring(0, 1)] ||
      { bank: "Unknown Bank", scheme: "UNKNOWN", type: "UNKNOWN", country: "Unknown" }

    setBinResult({
      bin,
      ...info,
      checkedAt: new Date().toLocaleString(),
    })
  }

  function formatExpiry(value: string) {
    let cleaned = value.replace(/\D/g, "")
    cleaned = cleaned.substring(0, 4)
    if (cleaned.length >= 3) return cleaned.substring(0, 2) + "/" + cleaned.substring(2)
    return cleaned
  }

  function logout() {
    localStorage.removeItem("userAuth")
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  function requestRecharge() {
    if (!rechargeAmount) { alert("Enter recharge amount"); return }
    alert("Recharge request sent to admin!")
    setRechargeAmount("")
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
            <li onClick={() => setShowPlans(true)} className="hover:text-yellow-400 cursor-pointer">
              Plans / Tariffs
            </li>
          </ul>
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
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 p-3 rounded font-semibold w-full">
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Card Inquiry Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded font-bold ${credits > 0 ? "bg-gray-800 text-green-400" : "bg-red-900 text-red-400"}`}>
              Credits: {credits}
            </div>
            <img src="https://i.pravatar.cc/40" className="w-10 h-10 rounded-full" />
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
              maxLength={19}
              className="w-full p-3 rounded bg-gray-700 mb-4 outline-none tracking-widest"
              onChange={(e) => {
                setResult(null)
                setCard(e.target.value.replace(/\D/g, "").substring(0, 16))
              }}
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
              disabled={checking}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold disabled:opacity-50"
            >
              {checking ? "⏳ Checking..." : "Check Card"}
            </button>

            {/* ✅ RESULT */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg border ${
                result.status === "LIVE"
                  ? "border-green-500 bg-green-900/20"
                  : result.status === "DEAD"
                  ? "border-red-500 bg-red-900/20"
                  : "border-yellow-500 bg-yellow-900/20"
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Result</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    result.status === "LIVE"
                      ? "bg-green-500 text-white"
                      : result.status === "DEAD"
                      ? "bg-red-500 text-white"
                      : "bg-yellow-500 text-black"
                  }`}>
                    {result.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Card</span>
                    <span className="font-mono">{result.cardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expiry</span>
                    <span>{result.expiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type</span>
                    <span className="text-blue-400 font-semibold">{result.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank</span>
                    <span>{result.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="text-yellow-400">{result.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance</span>
                    <span className={result.status === "LIVE" ? "text-green-400 font-bold" : "text-gray-500"}>
                      {result.balance}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency</span>
                    <span>{result.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country</span>
                    <span>{result.country}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                    <span className="text-gray-400">Checked At</span>
                    <span className="text-xs text-gray-400">{result.checkedAt}</span>
                  </div>
                </div>
              </div>
            )}
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
              onChange={(e) => {
                setBinResult(null)
                setBin(e.target.value.replace(/\D/g, ""))
              }}
            />
            <button
              onClick={handleBinCheck}
              className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-semibold"
            >
              Check BIN
            </button>

            {/* BIN RESULT */}
            {binResult && (
              <div className="mt-6 p-4 rounded-lg border border-blue-500 bg-blue-900/20">
                <h3 className="font-bold text-lg mb-3">BIN Result</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">BIN</span>
                    <span className="font-mono font-bold">{binResult.bin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank</span>
                    <span>{binResult.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scheme</span>
                    <span className="text-blue-400 font-semibold">{binResult.scheme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type</span>
                    <span>{binResult.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country</span>
                    <span>{binResult.country}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400">Checked At</span>
                    <span className="text-xs text-gray-400">{binResult.checkedAt}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* PLANS POPUP */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg w-[420px]">
            <h2 className="text-xl font-bold mb-6 text-center">Credit Tariffs</h2>
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
