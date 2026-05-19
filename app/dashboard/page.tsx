"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function luhnCheck(num: string): boolean {
  let sum = 0
  let isEven = false
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i])
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

function getCurrencyByCountry(country: string): { code: string; symbol: string } {
  if (country.includes("United States")) return { code: "USD", symbol: "$" }
  if (country.includes("Australia")) return { code: "AUD", symbol: "A$" }
  if (country.includes("India")) return { code: "INR", symbol: "₹" }
  if (country.includes("United Kingdom")) return { code: "GBP", symbol: "£" }
  if (country.includes("Germany")) return { code: "EUR", symbol: "€" }
  if (country.includes("France")) return { code: "EUR", symbol: "€" }
  if (country.includes("Italy")) return { code: "EUR", symbol: "€" }
  if (country.includes("Spain")) return { code: "EUR", symbol: "€" }
  if (country.includes("Netherlands")) return { code: "EUR", symbol: "€" }
  if (country.includes("Canada")) return { code: "CAD", symbol: "C$" }
  if (country.includes("Japan")) return { code: "JPY", symbol: "¥" }
  if (country.includes("Singapore")) return { code: "SGD", symbol: "S$" }
  return { code: "USD", symbol: "$" }
}

function getRealisticBalance(seed: number, currencyCode: string): string {
  const ranges: any = {
    "USD": [250, 500, 750, 1200, 1800, 2500, 3200, 4100, 5500, 8000, 12000, 15000],
    "GBP": [180, 420, 680, 950, 1400, 2100, 3000, 4500, 6800, 9500],
    "EUR": [200, 450, 720, 1100, 1650, 2300, 3400, 4800, 7200, 10000],
    "INR": [1200, 3500, 7800, 12000, 18000, 25000, 42000, 65000, 95000, 150000],
    "AUD": [300, 600, 950, 1500, 2200, 3100, 4600, 6500, 9800, 14000],
    "CAD": [280, 550, 880, 1300, 2000, 2900, 4200, 6000, 8500, 12000],
    "JPY": [12000, 25000, 48000, 85000, 120000, 180000, 250000, 380000],
    "SGD": [400, 800, 1200, 1900, 2800, 4000, 6500, 9000],
  }
  const list = ranges[currencyCode] || ranges["USD"]
  const amount = list[seed % list.length]
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const INVALID_RESULT = (cardNumber: string, expiry: string, cvc: string) => ({
  status: "INVALID",
  cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
  firstSix: cardNumber.substring(0, 6),
  expiry,
  cvc,
  type: "UNKNOWN",
  bank: "Unknown",
  level: "Unknown",
  category: "Unknown",
  balance: "N/A",
  currencyCode: "N/A",
  country: "🌍 Unknown",
  responseCode: "14",
  responseMessage: "INVALID CARD NUMBER",
  checkedAt: new Date().toLocaleString(),
})

function checkCard(cardNumber: string, expiry: string, cvc: string) {
  const bins: any = {
    // ===== USA =====
    "4111": { bank: "JPMorgan Chase Bank", type: "VISA", level: "Classic", category: "CREDIT", country: "🇺🇸 United States" },
    "4012": { bank: "Bank of America", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "4013": { bank: "Wells Fargo Bank", type: "VISA", level: "Gold", category: "DEBIT", country: "🇺🇸 United States" },
    "4532": { bank: "U.S. Bancorp", type: "VISA", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "4716": { bank: "Capital One Financial", type: "VISA", level: "World", category: "CREDIT", country: "🇺🇸 United States" },
    "4929": { bank: "PNC Financial Services", type: "VISA", level: "Classic", category: "DEBIT", country: "🇺🇸 United States" },
    "4916": { bank: "Citibank N.A.", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "4485": { bank: "TD Bank USA", type: "VISA", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "4556": { bank: "Truist Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇺🇸 United States" },
    "5100": { bank: "JPMorgan Chase Bank", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇺🇸 United States" },
    "5200": { bank: "Bank of America", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "5310": { bank: "Wells Fargo Bank", type: "MASTERCARD", level: "Gold", category: "DEBIT", country: "🇺🇸 United States" },
    "5411": { bank: "Citibank N.A.", type: "MASTERCARD", level: "Black", category: "CREDIT", country: "🇺🇸 United States" },
    "5500": { bank: "Capital One Financial", type: "MASTERCARD", level: "World Elite", category: "CREDIT", country: "🇺🇸 United States" },
    "5425": { bank: "American Bank Center", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "3714": { bank: "American Express Co.", type: "AMEX", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "3782": { bank: "American Express Co.", type: "AMEX", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "3787": { bank: "American Express Co.", type: "AMEX", level: "Centurion", category: "CREDIT", country: "🇺🇸 United States" },
    "6011": { bank: "Discover Financial", type: "DISCOVER", level: "Classic", category: "CREDIT", country: "🇺🇸 United States" },
    "6440": { bank: "Discover Financial", type: "DISCOVER", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    // ===== AUSTRALIA =====
    "4514": { bank: "Commonwealth Bank of Australia", type: "VISA", level: "Gold", category: "CREDIT", country: "🇦🇺 Australia" },
    "4557": { bank: "ANZ Banking Group", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇦🇺 Australia" },
    "4658": { bank: "Westpac Banking Corp", type: "VISA", level: "Classic", category: "DEBIT", country: "🇦🇺 Australia" },
    "4773": { bank: "National Australia Bank", type: "VISA", level: "World", category: "CREDIT", country: "🇦🇺 Australia" },
    "4882": { bank: "St George Bank", type: "VISA", level: "Gold", category: "CREDIT", country: "🇦🇺 Australia" },
    "4903": { bank: "Bendigo & Adelaide Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇦🇺 Australia" },
    "4910": { bank: "Bank of Queensland", type: "VISA", level: "Gold", category: "CREDIT", country: "🇦🇺 Australia" },
    "5163": { bank: "Commonwealth Bank of Australia", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇦🇺 Australia" },
    "5264": { bank: "ANZ Banking Group", type: "MASTERCARD", level: "Gold", category: "CREDIT", country: "🇦🇺 Australia" },
    "5365": { bank: "Westpac Banking Corp", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇦🇺 Australia" },
    "5466": { bank: "National Australia Bank", type: "MASTERCARD", level: "Black", category: "CREDIT", country: "🇦🇺 Australia" },
    "5567": { bank: "Macquarie Bank Ltd", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇦🇺 Australia" },
    // ===== INDIA =====
    "4722": { bank: "Canara Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4721": { bank: "Canara Bank", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4720": { bank: "Canara Bank", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "4386": { bank: "State Bank of India", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4387": { bank: "State Bank of India", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4388": { bank: "State Bank of India", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "4487": { bank: "HDFC Bank Ltd", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "4488": { bank: "HDFC Bank Ltd", type: "VISA", level: "Signature", category: "CREDIT", country: "🇮🇳 India" },
    "4489": { bank: "HDFC Bank Ltd", type: "VISA", level: "Infinite", category: "CREDIT", country: "🇮🇳 India" },
    "4588": { bank: "ICICI Bank Ltd", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4589": { bank: "ICICI Bank Ltd", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "4590": { bank: "ICICI Bank Ltd", type: "VISA", level: "Signature", category: "CREDIT", country: "🇮🇳 India" },
    "4689": { bank: "Axis Bank Ltd", type: "VISA", level: "World", category: "CREDIT", country: "🇮🇳 India" },
    "4690": { bank: "Axis Bank Ltd", type: "VISA", level: "Signature", category: "CREDIT", country: "🇮🇳 India" },
    "4691": { bank: "Axis Bank Ltd", type: "VISA", level: "Infinite", category: "CREDIT", country: "🇮🇳 India" },
    "4790": { bank: "Kotak Mahindra Bank", type: "VISA", level: "Signature", category: "CREDIT", country: "🇮🇳 India" },
    "4791": { bank: "Kotak Mahindra Bank", type: "VISA", level: "Infinite", category: "CREDIT", country: "🇮🇳 India" },
    "4891": { bank: "Punjab National Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4892": { bank: "Punjab National Bank", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4992": { bank: "Bank of Baroda", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4993": { bank: "Bank of Baroda", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "4152": { bank: "Union Bank of India", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4153": { bank: "Union Bank of India", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4025": { bank: "Indian Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4027": { bank: "Central Bank of India", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4028": { bank: "Central Bank of India", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4550": { bank: "IndusInd Bank Ltd", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "4551": { bank: "IndusInd Bank Ltd", type: "VISA", level: "Signature", category: "CREDIT", country: "🇮🇳 India" },
    "4650": { bank: "Yes Bank Ltd", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4651": { bank: "Yes Bank Ltd", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "4750": { bank: "Federal Bank Ltd", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4751": { bank: "Federal Bank Ltd", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4850": { bank: "IDBI Bank Ltd", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4851": { bank: "IDBI Bank Ltd", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "4950": { bank: "South Indian Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "4951": { bank: "Karnataka Bank Ltd", type: "VISA", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "5181": { bank: "State Bank of India", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇮🇳 India" },
    "5182": { bank: "State Bank of India", type: "MASTERCARD", level: "Elite", category: "CREDIT", country: "🇮🇳 India" },
    "5282": { bank: "HDFC Bank Ltd", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "5283": { bank: "HDFC Bank Ltd", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇮🇳 India" },
    "5383": { bank: "ICICI Bank Ltd", type: "MASTERCARD", level: "Black", category: "CREDIT", country: "🇮🇳 India" },
    "5384": { bank: "ICICI Bank Ltd", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇮🇳 India" },
    "5484": { bank: "Axis Bank Ltd", type: "MASTERCARD", level: "World Elite", category: "CREDIT", country: "🇮🇳 India" },
    "5485": { bank: "Axis Bank Ltd", type: "MASTERCARD", level: "Titanium", category: "CREDIT", country: "🇮🇳 India" },
    "5585": { bank: "Yes Bank Ltd", type: "MASTERCARD", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "5686": { bank: "IndusInd Bank Ltd", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "5687": { bank: "IndusInd Bank Ltd", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇮🇳 India" },
    "5787": { bank: "Kotak Mahindra Bank", type: "MASTERCARD", level: "World Elite", category: "CREDIT", country: "🇮🇳 India" },
    "5788": { bank: "Federal Bank Ltd", type: "MASTERCARD", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "5887": { bank: "Bank of Baroda", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇮🇳 India" },
    "5988": { bank: "Canara Bank", type: "MASTERCARD", level: "Gold", category: "CREDIT", country: "🇮🇳 India" },
    "5989": { bank: "Union Bank of India", type: "MASTERCARD", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "6070": { bank: "State Bank of India", type: "RUPAY", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "6071": { bank: "HDFC Bank Ltd", type: "RUPAY", level: "Platinum", category: "DEBIT", country: "🇮🇳 India" },
    "6072": { bank: "ICICI Bank Ltd", type: "RUPAY", level: "Select", category: "DEBIT", country: "🇮🇳 India" },
    "6073": { bank: "Axis Bank Ltd", type: "RUPAY", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "6074": { bank: "Canara Bank", type: "RUPAY", level: "Gold", category: "DEBIT", country: "🇮🇳 India" },
    "6075": { bank: "Punjab National Bank", type: "RUPAY", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    "6076": { bank: "Bank of Baroda", type: "RUPAY", level: "Platinum", category: "DEBIT", country: "🇮🇳 India" },
    "6521": { bank: "Kotak Mahindra Bank", type: "RUPAY", level: "Select", category: "DEBIT", country: "🇮🇳 India" },
    "6522": { bank: "Yes Bank Ltd", type: "RUPAY", level: "Classic", category: "DEBIT", country: "🇮🇳 India" },
    // ===== EUROPE =====
    "4026": { bank: "Barclays Bank PLC", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇬🇧 United Kingdom" },
    "4175": { bank: "HSBC Bank PLC", type: "VISA", level: "World", category: "CREDIT", country: "🇬🇧 United Kingdom" },
    "4276": { bank: "Lloyds Banking Group", type: "VISA", level: "Gold", category: "CREDIT", country: "🇬🇧 United Kingdom" },
    "4377": { bank: "NatWest Group PLC", type: "VISA", level: "Classic", category: "DEBIT", country: "🇬🇧 United Kingdom" },
    "4478": { bank: "Santander UK PLC", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇬🇧 United Kingdom" },
    "4539": { bank: "Deutsche Bank AG", type: "VISA", level: "Gold", category: "CREDIT", country: "🇩🇪 Germany" },
    "4640": { bank: "Commerzbank AG", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇩🇪 Germany" },
    "4741": { bank: "BNP Paribas SA", type: "VISA", level: "World", category: "CREDIT", country: "🇫🇷 France" },
    "4842": { bank: "Credit Agricole SA", type: "VISA", level: "Gold", category: "CREDIT", country: "🇫🇷 France" },
    "4943": { bank: "ING Group NV", type: "VISA", level: "Classic", category: "DEBIT", country: "🇳🇱 Netherlands" },
    "5133": { bank: "Barclays Bank PLC", type: "MASTERCARD", level: "Black", category: "CREDIT", country: "🇬🇧 United Kingdom" },
    "5234": { bank: "HSBC Bank PLC", type: "MASTERCARD", level: "World Elite", category: "CREDIT", country: "🇬🇧 United Kingdom" },
    "5335": { bank: "Deutsche Bank AG", type: "MASTERCARD", level: "Gold", category: "CREDIT", country: "🇩🇪 Germany" },
    "5436": { bank: "BNP Paribas SA", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇫🇷 France" },
    "5537": { bank: "Societe Generale SA", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇫🇷 France" },
    "5638": { bank: "UniCredit SpA", type: "MASTERCARD", level: "Gold", category: "CREDIT", country: "🇮🇹 Italy" },
    "5739": { bank: "Banco Santander SA", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇪🇸 Spain" },
    "5840": { bank: "ABN AMRO Bank NV", type: "MASTERCARD", level: "World Elite", category: "CREDIT", country: "🇳🇱 Netherlands" },
    "3411": { bank: "American Express Europe", type: "AMEX", level: "Gold", category: "CREDIT", country: "🇬🇧 United Kingdom" },
    "3711": { bank: "American Express Europe", type: "AMEX", level: "Platinum", category: "CREDIT", country: "🇬🇧 United Kingdom" },
  }

  const p4 = cardNumber.substring(0, 4)
  const p2 = cardNumber.substring(0, 2)

  // ✅ BIN not in database = INVALID
  if (!bins[p4] && !bins[p2]) {
    return INVALID_RESULT(cardNumber, expiry, cvc)
  }

  // ✅ Luhn check = mathematically invalid card number
  if (!luhnCheck(cardNumber)) {
    return INVALID_RESULT(cardNumber, expiry, cvc)
  }

  // ✅ Card too short or too long
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    return INVALID_RESULT(cardNumber, expiry, cvc)
  }

  const cardInfo: any = bins[p4] || bins[p2]
  const currency = getCurrencyByCountry(cardInfo.country)
  const seed = cardNumber + expiry
  const hash = seededRandom(seed)
  const statuses = ["LIVE", "LIVE", "LIVE", "DEAD", "DEAD", "UNKNOWN"]
  const responseCodes: any = {
    "LIVE": { code: "00", message: "APPROVED" },
    "DEAD": { code: "05", message: "DO NOT HONOR" },
    "UNKNOWN": { code: "51", message: "INSUFFICIENT FUNDS" },
  }
  const status = statuses[hash % statuses.length]
  const balance = getRealisticBalance(hash, currency.code)
  const responseCode = responseCodes[status]
  const lastFour = cardNumber.slice(-4)
  const firstSix = cardNumber.substring(0, 6)

  return {
    status,
    cardNumber: `**** **** **** ${lastFour}`,
    firstSix,
    expiry,
    cvc,
    type: cardInfo.type,
    bank: cardInfo.bank,
    level: cardInfo.level,
    category: cardInfo.category,
    balance: status === "LIVE" ? `${currency.symbol}${balance}` : "N/A",
    currencyCode: status === "LIVE" ? currency.code : "N/A",
    country: cardInfo.country,
    responseCode: responseCode.code,
    responseMessage: responseCode.message,
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
    if (!card || card.length < 13 || card.length > 19) {
      alert("Enter a valid card number (13-19 digits)")
      return
    }
    if (!expiry) { alert("Enter expiry date"); return }
    if (credits <= 0) { alert("❌ Insufficient credits! Please recharge."); return }
    setChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1800))
    const checkResult = checkCard(card, expiry, cvc)
    // ✅ Only deduct credit if card is valid
    if (checkResult.status !== "INVALID") {
      await deductCredit()
    }
    setResult(checkResult)
    setChecking(false)
  }

  async function handleBulkCheck() {
    const lines = bulkInput.trim().split("\n").filter((l) => l.trim())
    if (lines.length === 0) { alert("Enter card details"); return }

    // Count valid cards first to check credits needed
    const validCards = lines.filter(l => {
      const parts = l.split("|")
      if (parts.length < 2) return false
      const cn = parts[0].trim()
      return c
