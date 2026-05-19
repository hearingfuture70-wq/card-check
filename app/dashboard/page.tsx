"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

function seededRandom(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function checkCard(cardNumber: string, expiry: string, cvc: string, country: string) {
  const bins: any = {
    // ========== USA ==========
    "4111": { bank: "Chase Bank USA", type: "VISA", level: "Classic", country: "🇺🇸 United States" },
    "4012": { bank: "Bank of America", type: "VISA", level: "Platinum", country: "🇺🇸 United States" },
    "4013": { bank: "Wells Fargo", type: "VISA", level: "Gold", country: "🇺🇸 United States" },
    "4024": { bank: "Citibank USA", type: "VISA", level: "Classic", country: "🇺🇸 United States" },
    "4532": { bank: "US Bank", type: "VISA", level: "Gold", country: "🇺🇸 United States" },
    "4716": { bank: "Capital One USA", type: "VISA", level: "World", country: "🇺🇸 United States" },
    "4929": { bank: "PNC Bank", type: "VISA", level: "Classic", country: "🇺🇸 United States" },
    "5100": { bank: "Chase Mastercard", type: "MASTERCARD", level: "World", country: "🇺🇸 United States" },
    "5200": { bank: "Bank of America MC", type: "MASTERCARD", level: "Platinum", country: "🇺🇸 United States" },
    "5310": { bank: "Wells Fargo MC", type: "MASTERCARD", level: "Gold", country: "🇺🇸 United States" },
    "5411": { bank: "Citibank MC", type: "MASTERCARD", level: "Black", country: "🇺🇸 United States" },
    "5500": { bank: "Capital One MC", type: "MASTERCARD", level: "World Elite", country: "🇺🇸 United States" },
    "3714": { bank: "American Express USA", type: "AMEX", level: "Gold", country: "🇺🇸 United States" },
    "3782": { bank: "American Express USA", type: "AMEX", level: "Platinum", country: "🇺🇸 United States" },
    "6011": { bank: "Discover USA", type: "DISCOVER", level: "Classic", country: "🇺🇸 United States" },
    "6440": { bank: "Discover USA", type: "DISCOVER", level: "Gold", country: "🇺🇸 United States" },
    // ========== AUSTRALIA ==========
    "4514": { bank: "Commonwealth Bank", type: "VISA", level: "Gold", country: "🇦🇺 Australia" },
    "4557": { bank: "ANZ Bank", type: "VISA", level: "Platinum", country: "🇦🇺 Australia" },
    "4658": { bank: "Westpac Bank", type: "VISA", level: "Classic", country: "🇦🇺 Australia" },
    "4773": { bank: "NAB Bank", type: "VISA", level: "World", country: "🇦🇺 Australia" },
    "4882": { bank: "St George Bank", type: "VISA", level: "Gold", country: "🇦🇺 Australia" },
    "4903": { bank: "Bendigo Bank", type: "VISA", level: "Classic", country: "🇦🇺 Australia" },
    "5163": { bank: "Commonwealth Bank MC", type: "MASTERCARD", level: "Platinum", country: "🇦🇺 Australia" },
    "5264": { bank: "ANZ Mastercard", type: "MASTERCARD", level: "Gold", country: "🇦🇺 Australia" },
    "5365": { bank: "Westpac MC", type: "MASTERCARD", level: "World", country: "🇦🇺 Australia" },
    "5466": { bank: "NAB Mastercard", type: "MASTERCARD", level: "Black", country: "🇦🇺 Australia" },
    "5567": { bank: "Macquarie Bank", type: "MASTERCARD", level: "Platinum", country: "🇦🇺 Australia" },
    // ========== INDIA ==========
    "4386": { bank: "State Bank of India", type: "VISA", level: "Classic", country: "🇮🇳 India" },
    "4487": { bank: "HDFC Bank", type: "VISA", level: "Platinum", country: "🇮🇳 India" },
    "4588": { bank: "ICICI Bank", type: "VISA", level: "Gold", country: "🇮🇳 India" },
    "4689": { bank: "Axis Bank", type: "VISA", level: "World", country: "🇮🇳 India" },
    "4790": { bank: "Kotak Mahindra Bank", type: "VISA", level: "Signature", country: "🇮🇳 India" },
    "4891": { bank: "Punjab National Bank", type: "VISA", level: "Classic", country: "🇮🇳 India" },
    "4992": { bank: "Bank of Baroda", type: "VISA", level: "Gold", country: "🇮🇳 India" },
    "5181": { bank: "SBI Mastercard", type: "MASTERCARD", level: "World", country: "🇮🇳 India" },
    "5282": { bank: "HDFC Mastercard", type: "MASTERCARD", level: "Platinum", country: "🇮🇳 India" },
    "5383": { bank: "ICICI Mastercard", type: "MASTERCARD", level: "Black", country: "🇮🇳 India" },
    "5484": { bank: "Axis Bank MC", type: "MASTERCARD", level: "World Elite", country: "🇮🇳 India" },
    "5585": { bank: "Yes Bank", type: "MASTERCARD", level: "Gold", country: "🇮🇳 India" },
    "5686": { bank: "IndusInd Bank", type: "MASTERCARD", level: "Platinum", country: "🇮🇳 India" },
    "6070": { bank: "RuPay SBI", type: "RUPAY", level: "Classic", country: "🇮🇳 India" },
    "6071": { bank: "RuPay HDFC", type: "RUPAY", level: "Platinum", country: "🇮🇳 India" },
    "6072": { bank: "RuPay ICICI", type: "RUPAY", level: "Select", country: "🇮🇳 India" },
    // ========== EUROPE ==========
    "4026": { bank: "Barclays Bank UK", type: "VISA", level: "Platinum", country: "🇬🇧 United Kingdom" },
    "4175": { bank: "HSBC UK", type: "VISA", level: "World", country: "🇬🇧 United Kingdom" },
    "4276": { bank: "Lloyds Bank", type: "VISA", level: "Gold", country: "🇬🇧 United Kingdom" },
    "4377": { bank: "NatWest Bank", type: "VISA", level: "Classic", country: "🇬🇧 United Kingdom" },
    "4478": { bank: "Santander UK", type: "VISA", level: "Platinum", country: "🇬🇧 United Kingdom" },
    "4539": { bank: "Deutsche Bank", type: "VISA", level: "Gold", country: "🇩🇪 Germany" },
    "4640": { bank: "Commerzbank", type: "VISA", level: "Platinum", country: "🇩🇪 Germany" },
    "4741": { bank: "BNP Paribas", type: "VISA", level: "World", country: "🇫🇷 France" },
    "4842": { bank: "Credit Agricole", type: "VISA", level: "Gold", country: "🇫🇷 France" },
    "4943": { bank: "ING Bank", type: "VISA", level: "Classic", country: "🇳🇱 Netherlands" },
    "5133": { bank: "Barclays MC", type: "MASTERCARD", level: "Black", country: "🇬🇧 United Kingdom" },
    "5234": { bank: "HSBC MC UK", type: "MASTERCARD", level: "World Elite", country: "🇬🇧 United Kingdom" },
    "5335": { bank: "Deutsche Bank MC", type: "MASTERCARD", level: "Gold", country: "🇩🇪 Germany" },
    "5436": { bank: "BNP Paribas MC", type: "MASTERCARD", level: "Platinum", country: "🇫🇷 France" },
    "5537": { bank: "Societe Generale", type: "MASTERCARD", level: "World", country: "🇫🇷 France" },
    "5638": { bank: "UniCredit Bank", type: "MASTERCARD", level: "Gold", country: "🇮🇹 Italy" },
    "5739": { bank: "Santander EU", type: "MASTERCARD", level: "Platinum", country: "🇪🇸 Spain" },
    "5840": { bank: "ABN AMRO", type: "MASTERCARD", level: "World Elite", country: "🇳🇱 Netherlands" },
    "3411": { bank: "Amex Europe", type: "AMEX", level: "Gold", country: "🇬🇧 United Kingdom" },
    "3711": { bank: "Amex UK Platinum", type: "AMEX", level: "Platinum", country: "🇬🇧 United Kingdom" },
    // ========== FALLBACK ==========
    "4": { bank: "VISA Issuing Bank", type: "VISA", level: "Classic", country: "🌍 International" },
    "51": { bank: "Mastercard Bank", type: "MASTERCARD", level: "Gold", country: "🌍 International" },
    "52": { bank: "Mastercard Bank", type: "MASTERCARD", level: "Platinum", country: "🌍 International" },
    "53": { bank: "Mastercard Bank", type: "MASTERCARD", level: "Classic", country: "🌍 International" },
    "54": { bank: "Mastercard Bank", type: "MASTERCARD", level: "World", country: "🌍 International" },
    "55": { bank: "Mastercard Bank", type: "MASTERCARD", level: "Black", country: "🌍 International" },
    "34": { bank: "American Express", type: "AMEX", level: "Gold", country: "🌍 International" },
    "37": { bank: "American Express", type: "AMEX", level: "Platinum", country: "🌍 International" },
    "6": { bank: "Discover / RuPay", type: "DISCOVER", level: "Classic", country: "🌍 International" },
  }

  const statuses = ["LIVE", "LIVE", "LIVE", "DEAD", "DEAD", "UNKNOWN"]
  const balances = [
    "1,250.00", "3,780.50", "542.20", "12,000.00",
    "890.75", "4,321.00", "7,654.32", "230.10",
    "15,000.00", "2,100.80"
  ]
  const currencies: any = {
    "VISA": { code: "USD", symbol: "$" },
    "MASTERCARD": { code: "EUR", symbol: "€" },
    "AMEX": { code: "GBP", symbol: "£" },
    "DISCOVER": { code: "AUD", symbol: "A$" },
    "RUPAY": { code: "INR", symbol: "₹" },
  }

  let cardInfo = { bank: "Unknown Bank", type: "VISA", level: "Classic", country: "🌍 International" }
  const prefix4 = cardNumber.substring(0, 4)
  const prefix2 = cardNumber.substring(0, 2)
  const prefix1 = cardNumber.substring(0, 1)
  if (bins[prefix4]) cardInfo = bins[prefix4]
  else if (bins[prefix2]) cardInfo = bins[prefix2]
  else if (bins[prefix1]) cardInfo = bins[prefix1]

  const seed = cardNumber + expiry
  const hash = seededRandom(seed)

  const status = statuses[hash % statuses.length]
  const balance = balances[hash % balances.length]
  const currency = currencies[cardInfo.type] || { code: "USD", symbol: "$" }
  const lastFour = cardNumber.slice(-4)

  return {
    status,
    cardNumber: `**** **** **** ${lastFour}`,
    expiry,
    cvc,
    type: cardInfo.type,
    bank: cardInfo.bank,
    level: cardInfo.level,
    balance: status === "LIVE" ? `${currency.symbol}${balance}` : "N/A",
    currencyCode: status === "LIVE" ? currency.code : "N/A",
    currencySymbol: currency.symbol,
    country: cardInfo.country,
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
  const [checking, setChecking] = useState(false)
  const [bulkInput, setBulkInput] = useState("")
  const [bulkResults, setBulkResults] = useState<any[]>([])
  const [bulkChecking, setBulkChecking] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [binResult, setBinResult] = useState<any>(null)

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

  async function deductCredit() {
    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentUser.id, credits: -1 }),
      })
      setCredits((prev) => prev - 1)
    } catch (err) {}
  }

  async function handleCheck() {
    if (!card || card.length < 12) { alert("Enter a valid card number"); return }
    if (!expiry) { alert("Enter expiry date"); return }
    if (credits <= 0) { alert("❌ Insufficient credits! Please recharge."); return }
    setChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1500))
    await deductCredit()
    const checkResult = checkCard(card, expiry, cvc, country)
    setResult(checkResult)
    setChecking(false)
  }

  async function handleBulkCheck() {
    const lines = bulkInput.trim().split("\n").filter((l) => l.trim())
    if (lines.length === 0) { alert("Enter card details"); return }
    if (credits < lines.length) {
      alert(`❌ Need ${lines.length} credits but you only have ${credits}`)
      return
    }
    setBulkChecking(true)
    setBulkResults([])
    setBulkProgress(0)
    const results: any[] = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const parts = line.split("|")
      if (parts.length < 2) {
        results.push({ raw: line, status: "INVALID", error: "Wrong format" })
        setBulkResults([...results])
        continue
      }
      const cardNum = parts[0].trim()
      const exp = parts[1].trim()
      const cvv = parts[2]?.trim() || ""
      await new Promise((r) => setTimeout(r, 800))
      await deductCredit()
      const res = checkCard(cardNum, exp, cvv, "Auto")
      results.push({ ...res, rawLine: line })
      setBulkResults([...results])
      setBulkProgress(i + 1)
    }
    setBulkChecking(false)
  }

  function clearBulk() {
    setBulkInput("")
    setBulkResults([])
    setBulkProgress(0)
  }

  function handleBinCheck() {
    if (!bin || bin.length < 4) { alert("Enter at least 4 digits"); return }
    const binData: any = {
      "4111": { bank: "Chase Bank USA", scheme: "VISA", type: "CREDIT", country: "🇺🇸 United States" },
      "4514": { bank: "Commonwealth Bank", scheme: "VISA", type: "DEBIT", country: "🇦🇺 Australia" },
      "4487": { bank: "HDFC Bank", scheme: "VISA", type: "CREDIT", country: "🇮🇳 India" },
      "4026": { bank: "Barclays Bank", scheme: "VISA", type: "CREDIT", country: "🇬🇧 United Kingdom" },
      "5200": { bank: "Bank of America", scheme: "MASTERCARD", type: "CREDIT", country: "🇺🇸 United States" },
      "5163": { bank: "Commonwealth Bank", scheme: "MASTERCARD", type: "CREDIT", country: "🇦🇺 Australia" },
      "5282": { bank: "HDFC Mastercard", scheme: "MASTERCARD", type: "CREDIT", country: "🇮🇳 India" },
      "5133": { bank: "Barclays MC", scheme: "MASTERCARD", type: "CREDIT", country: "🇬🇧 United Kingdom" },
      "3714": { bank: "American Express", scheme: "AMEX", type: "CREDIT", country: "🇺🇸 United States" },
      "6011": { bank: "Discover", scheme: "DISCOVER", type: "CREDIT", country: "🇺🇸 United States" },
      "6070": { bank: "RuPay SBI", scheme: "RUPAY", type: "DEBIT", country: "🇮🇳 India" },
    }
    const schemes: any = {
      "4": { bank: "VISA Issuing Bank", scheme: "VISA", type: "CREDIT", country: "🌍 International" },
      "5": { bank: "Mastercard Issuing Bank", scheme: "MASTERCARD", type: "CREDIT", country: "🌍 International" },
      "3": { bank: "American Express", scheme: "AMEX", type: "CREDIT", country: "🇺🇸 United States" },
      "6": { bank: "Discover / RuPay", scheme: "DISCOVER", type: "DEBIT", country: "🌍 International" },
    }
    const info = binData[bin.substring(0, 4)] ||
      schemes[bin.substring(0, 1)] ||
      { bank: "Unknown Bank", scheme: "UNKNOWN", type: "UNKNOWN", country: "Unknown" }
    setBinResult({ bin, ...info, checkedAt: new Date().toLocaleString() })
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

  const liveCount = bulkResults.filter((r) => r.status === "LIVE").length
  const deadCount = bulkResults.filter((r) => r.status === "DEAD").length
  const unknownCount = bulkResults.filter((r) => r.status === "UNKNOWN").length

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
              onClick={() => { if (!rechargeAmount) { alert("Enter amount"); return } alert("Request sent to admin!"); setRechargeAmount("") }}
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

          {/* SINGLE CARD CHECKER */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Card Checker</h2>
            <input type="text" placeholder="Card Number" value={card} maxLength={16}
              className="w-full p-3 rounded bg-gray-700 mb-4 outline-none tracking-widest"
              onChange={(e) => { setResult(null); setCard(e.target.value.replace(/\D/g, "")) }} />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="MM/YY" value={expiry} maxLength={5}
                className="p-3 rounded bg-gray-700 outline-none"
                onChange={(e) => setExpiry(formatExpiry(e.target.value))} />
              <input type="text" placeholder="CVC" value={cvc} maxLength={4}
                className="p-3 rounded bg-gray-700 outline-none"
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))} />
            </div>
            <select className="w-full p-3 rounded bg-gray-700 mb-4" onChange={(e) => setCountry(e.target.value)}>
              <option>Select Country</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Germany</option>
              <option>Australia</option>
              <option>India</option>
              <option>France</option>
              <option>Italy</option>
              <option>Spain</option>
              <option>Netherlands</option>
            </select>
            <button onClick={handleCheck} disabled={checking}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold disabled:opacity-50">
              {checking ? "⏳ Checking..." : "Check Card"}
            </button>

            {result && (
              <div className={`mt-6 p-4 rounded-lg border ${
                result.status === "LIVE" ? "border-green-500 bg-green-900/20"
                : result.status === "DEAD" ? "border-red-500 bg-red-900/20"
                : "border-yellow-500 bg-yellow-900/20"}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Result</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    result.status === "LIVE" ? "bg-green-500 text-white"
                    : result.status === "DEAD" ? "bg-red-500 text-white"
                    : "bg-yellow-500 text-black"}`}>
                    {result.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ["Card", result.cardNumber],
                    ["Expiry", result.expiry],
                    ["Type", result.type],
                    ["Bank", result.bank],
                    ["Level", result.level],
                    ["Balance", result.balance],
                    ["Currency", result.currencyCode],
                    ["Country", result.country],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400">{label}</span>
                      <span className={
                        label === "Balance" && result.status === "LIVE" ? "text-green-400 font-bold"
                        : label === "Type" ? "text-blue-400 font-semibold"
                        : label === "Level" ? "text-yellow-400" : ""}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400">Checked At</span>
                    <span className="text-xs text-gray-400">{result.checkedAt}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BULK CHECKER */}
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Bulk Card Checker</h2>
              {bulkResults.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-600 px-2 py-1 rounded">✅ {liveCount} Live</span>
                  <span className="bg-red-600 px-2 py-1 rounded">❌ {deadCount} Dead</span>
                  <span className="bg-yellow-600 text-black px-2 py-1 rounded">⚠️ {unknownCount} Unknown</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Format: <span className="text-blue-400 font-mono">CardNumber|MM/YY|CVV</span> — one per line
            </p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={`4111111111111111|12/25|123\n5200000000000007|08/26|456\n3714496353984312|11/24|789`}
              className="w-full p-3 bg-gray-700 rounded text-sm font-mono resize-none outline-none mb-3"
              rows={5}
            />
            <div className="flex gap-2 mb-3">
              <button onClick={handleBulkCheck} disabled={bulkChecking}
                className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold disabled:opacity-50">
                {bulkChecking
                  ? `⏳ Checking ${bulkProgress}/${bulkInput.trim().split("\n").filter(l => l.trim()).length}...`
                  : "🔍 Bulk Check"}
              </button>
              <button onClick={clearBulk} className="bg-gray-600 hover:bg-gray-500 px-4 rounded font-semibold">
                Clear
              </button>
            </div>
            {bulkChecking && (
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(bulkProgress / bulkInput.trim().split("\n").filter(l => l.trim()).length) * 100}%` }} />
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-96">
              {bulkResults.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border flex items-center justify-between text-sm ${
                  r.status === "LIVE" ? "border-green-500 bg-green-900/20"
                  : r.status === "DEAD" ? "border-red-500 bg-red-900/20"
                  : r.status === "INVALID" ? "border-gray-500 bg-gray-700/30"
                  : "border-yellow-500 bg-yellow-900/20"}`}>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs text-gray-300">{r.cardNumber || r.raw}</span>
                    <span className="text-xs text-gray-400">
                      {r.status !== "INVALID" ? `${r.expiry} • ${r.type} • ${r.bank} • ${r.country}` : "Invalid format"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.status === "LIVE" && (
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-sm">{r.balance}</div>
                        <div className="text-xs text-gray-400">{r.currencyCode}</div>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      r.status === "LIVE" ? "bg-green-500 text-white"
                      : r.status === "DEAD" ? "bg-red-500 text-white"
                      : r.status === "INVALID" ? "bg-gray-500 text-white"
                      : "bg-yellow-500 text-black"}`}>
                      {r.status === "LIVE" ? "✅ LIVE"
                      : r.status === "DEAD" ? "❌ DEAD"
                      : r.status === "INVALID" ? "⛔ INVALID"
                      : "⚠️ UNKNOWN"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
            <button onClick={() => setShowPlans(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold">
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
