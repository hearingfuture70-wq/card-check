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
  if (!/^\d+$/.test(num)) return false
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

const INVALID_RESULT = (cardNumber: string, expiry: string, cvc: string, message: string = "INVALID CARD NUMBER", code: string = "14") => ({
  status: "INVALID",
  cardNumber: cardNumber.length >= 4 ? `**** **** **** ${cardNumber.slice(-4)}` : cardNumber,
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
  responseCode: code,
  responseMessage: message,
  checkedAt: new Date().toLocaleString(),
})

function validateCard(cardNumber: string, expiry: string, cvc: string, bins: any): string | null {
  if (!cardNumber || !/^\d+$/.test(cardNumber)) return "INVALID FORMAT"
  if (cardNumber.length < 13 || cardNumber.length > 19) return "INVALID LENGTH"
  const p1 = cardNumber.substring(0, 1)
  if (!["3", "4", "5", "6"].includes(p1)) return "INVALID CARD NUMBER"
  const p4 = cardNumber.substring(0, 4)
  const p2 = cardNumber.substring(0, 2)
  if (!bins[p4] && !bins[p2]) return "BIN NOT FOUND"
  if (!luhnCheck(cardNumber)) return "INVALID CARD NUMBER"
  if (!expiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) return "INVALID EXPIRY"
  const [month, year] = expiry.split("/")
  const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1)
  const now = new Date()
  now.setDate(1)
  if (expDate < now) return "EXPIRED CARD"
  if (cvc && (!/^\d+$/.test(cvc) || cvc.length < 3 || cvc.length > 4)) return "INVALID CVV"
  return null
}

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
    // ===== TWO-DIGIT FALLBACKS =====
    "40": { bank: "Visa Issuing Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇺🇸 United States" },
    "41": { bank: "Visa Issuing Bank", type: "VISA", level: "Classic", category: "CREDIT", country: "🇺🇸 United States" },
    "42": { bank: "Visa Issuing Bank", type: "VISA", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "43": { bank: "Visa Issuing Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇺🇸 United States" },
    "44": { bank: "Visa Issuing Bank", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "45": { bank: "Visa Issuing Bank", type: "VISA", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "46": { bank: "Visa Issuing Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇺🇸 United States" },
    "47": { bank: "Visa Issuing Bank", type: "VISA", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "48": { bank: "Visa Issuing Bank", type: "VISA", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "49": { bank: "Visa Issuing Bank", type: "VISA", level: "Classic", category: "DEBIT", country: "🇺🇸 United States" },
    "51": { bank: "Mastercard Issuing Bank", type: "MASTERCARD", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "52": { bank: "Mastercard Issuing Bank", type: "MASTERCARD", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "53": { bank: "Mastercard Issuing Bank", type: "MASTERCARD", level: "Classic", category: "DEBIT", country: "🇺🇸 United States" },
    "54": { bank: "Mastercard Issuing Bank", type: "MASTERCARD", level: "World", category: "CREDIT", country: "🇺🇸 United States" },
    "55": { bank: "Mastercard Issuing Bank", type: "MASTERCARD", level: "Black", category: "CREDIT", country: "🇺🇸 United States" },
    "34": { bank: "American Express", type: "AMEX", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
    "37": { bank: "American Express", type: "AMEX", level: "Platinum", category: "CREDIT", country: "🇺🇸 United States" },
    "60": { bank: "Discover / RuPay Network", type: "DISCOVER", level: "Classic", category: "CREDIT", country: "🇺🇸 United States" },
    "65": { bank: "Discover Financial", type: "DISCOVER", level: "Gold", category: "CREDIT", country: "🇺🇸 United States" },
  }

  const validationError = validateCard(cardNumber, expiry, cvc, bins)
  if (validationError) {
    if (validationError === "EXPIRED CARD") {
      return INVALID_RESULT(cardNumber, expiry, cvc, "EXPIRED CARD", "54")
    }
    return INVALID_RESULT(cardNumber, expiry, cvc, validationError, "14")
  }

  const p4 = cardNumber.substring(0, 4)
  const p2 = cardNumber.substring(0, 2)
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

  // ─── Determine if all required fields are filled ───────────────────────────
  const isFormValid =
    card.trim().length >= 13 &&
    expiry.trim().length === 5 &&
    cvc.trim().length >= 3 &&
    country !== "" &&
    country !== "Select Country"

  useEffect(() => {
    if (typeof window === "undefined") return
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
    // Guard: all fields must be filled (button should already be disabled, but double-check)
    if (!isFormValid) return
    if (credits <= 0) { alert("❌ Insufficient credits!"); return }

    const cleanCard = card.replace(/\s/g, "")
    setChecking(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1800))
    const checkResult = checkCard(cleanCard, expiry, cvc)
    if (checkResult.status !== "INVALID") {
      await deductCredit()
    }
    setResult(checkResult)
    setChecking(false)
  }

  async function handleBulkCheck() {
    const lines = bulkInput.trim().split("\n").filter((l) => l.trim())
    if (lines.length === 0) { alert("Enter card details"); return }
    if (credits <= 0) { alert("❌ Insufficient credits!"); return }

    setBulkChecking(true)
    setBulkResults([])
    setBulkProgress(0)
    const results: any[] = []

    for (let i = 0; i < lines.length; i++) {
      if (credits - results.filter(r => r.status !== "INVALID").length <= 0) {
        results.push({ raw: lines[i].trim(), status: "INVALID", responseCode: "61", responseMessage: "INSUFFICIENT CREDITS" })
        setBulkResults([...results])
        setBulkProgress(i + 1)
        continue
      }
      const line = lines[i].trim()
      const parts = line.split("|")
      if (parts.length < 3) {
        // ── FIX: Bulk also requires CVV (at least 3 parts) ──
        results.push({ raw: line, status: "INVALID", responseCode: "14", responseMessage: "MISSING CVV — Use format: CardNumber|MM/YY|CVV" })
        setBulkResults([...results])
        setBulkProgress(i + 1)
        continue
      }
      const cardNum = parts[0].trim().replace(/\s/g, "")
      const exp = parts[1].trim()
      const cvv = parts[2].trim()
      if (!cvv || cvv.length < 3) {
        results.push({ raw: line, status: "INVALID", responseCode: "14", responseMessage: "INVALID CVV" })
        setBulkResults([...results])
        setBulkProgress(i + 1)
        continue
      }
      await new Promise((r) => setTimeout(r, 700))
      const res = checkCard(cardNum, exp, cvv)
      if (res.status !== "INVALID") {
        await deductCredit()
      }
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
    if (!bin || bin.length < 4 || !/^\d+$/.test(bin)) {
      alert("Enter at least 4 digits")
      return
    }
    const padded = bin.padEnd(16, "0")
    const res = checkCard(padded, "12/30", "000")
    if (res.status === "INVALID") {
      alert("❌ BIN not found in database")
      setBinResult(null)
      return
    }
    setBinResult({
      bin,
      bank: res.bank,
      scheme: res.type,
      category: res.category,
      level: res.level,
      country: res.country,
      currency: getCurrencyByCountry(res.country).code,
      checkedAt: res.checkedAt,
    })
  }

  function formatExpiry(value: string) {
    let cleaned = value.replace(/\D/g, "").substring(0, 4)
    if (cleaned.length >= 3) return cleaned.substring(0, 2) + "/" + cleaned.substring(2)
    return cleaned
  }

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userAuth")
      localStorage.removeItem("currentUser")
    }
    router.push("/")
  }

  const liveCount = bulkResults.filter((r) => r.status === "LIVE").length
  const deadCount = bulkResults.filter((r) => r.status === "DEAD").length
  const unknownCount = bulkResults.filter((r) => r.status === "UNKNOWN").length
  const invalidCount = bulkResults.filter((r) => r.status === "INVALID").length

  // Helper: tooltip message for disabled button
  const disabledReason = !card || card.length < 13
    ? "Enter a valid card number"
    : expiry.length < 5
    ? "Enter expiry (MM/YY)"
    : cvc.length < 3
    ? "CVC is required (3-4 digits)"
    : !country || country === "Select Country"
    ? "Select a country"
    : ""

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
            <li onClick={() => setShowPlans(true)} className="hover:text-yellow-400 cursor-pointer">Plans / Tariffs</li>
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
              onClick={() => {
                if (!rechargeAmount) { alert("Enter amount"); return }
                alert("Recharge request sent!")
                setRechargeAmount("")
              }}
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
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              {currentUser?.username?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">

          {/* SINGLE CARD CHECKER */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Card Checker</h2>

            <input
              type="text"
              placeholder="Card Number"
              value={card}
              maxLength={19}
              className="w-full p-3 rounded bg-gray-700 mb-4 outline-none tracking-widest font-mono"
              onChange={(e) => { setResult(null); setCard(e.target.value.replace(/\D/g, "")) }}
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="CVC *"
                  value={cvc}
                  maxLength={4}
                  className={`w-full p-3 rounded outline-none transition-colors ${
                    cvc.length >= 3 ? "bg-gray-700" : "bg-gray-700 border border-red-500/50"
                  }`}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                />
                {cvc.length === 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-semibold pointer-events-none">
                    required
                  </span>
                )}
              </div>
            </div>

            <select
              className="w-full p-3 rounded bg-gray-700 mb-4"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Select Country</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Germany</option>
              <option>France</option>
              <option>Italy</option>
              <option>Spain</option>
              <option>Netherlands</option>
              <option>Australia</option>
              <option>India</option>
              <option>Japan</option>
              <option>Singapore</option>
            </select>

            {/* ── CVC hint shown when card & expiry filled but CVC missing ── */}
            {card.length >= 13 && expiry.length === 5 && cvc.length < 3 && (
              <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
                ⚠️ Please enter CVC (3-4 digits) to enable card check
              </p>
            )}

            {/* ── THE FIXED BUTTON ── */}
            <div title={!isFormValid ? disabledReason : ""}>
              <button
                onClick={handleCheck}
                disabled={!isFormValid || checking}
                className={`w-full p-3 rounded font-semibold transition-all duration-200 ${
                  isFormValid && !checking
                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    : "bg-gray-600 cursor-not-allowed opacity-50"
                }`}
              >
                {checking ? "⏳ Processing..." : "Check Card"}
              </button>
            </div>

            {!isFormValid && (
              <p className="text-gray-500 text-xs text-center mt-2">
                {disabledReason}
              </p>
            )}

            {result && result.status === "INVALID" && (
              <div className="mt-6 p-4 rounded-lg border border-gray-500 bg-gray-700/30">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Result</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-500 text-white">⛔ INVALID</span>
                </div>
                <div className="bg-gray-600/30 text-xs font-mono px-3 py-2 rounded mb-3 text-gray-300">
                  RC: {result.responseCode} — {result.responseMessage}
                </div>
                <p className="text-gray-400 text-sm text-center py-2">This card could not be validated.</p>
                <p className="text-gray-500 text-xs text-center">No credits were deducted.</p>
              </div>
            )}

            {result && result.status !== "INVALID" && (
              <div className={`mt-6 p-4 rounded-lg border ${
                result.status === "LIVE" ? "border-green-500 bg-green-900/20"
                : result.status === "DEAD" ? "border-red-500 bg-red-900/20"
                : "border-yellow-500 bg-yellow-900/20"}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Result</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">RC: {result.responseCode}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      result.status === "LIVE" ? "bg-green-500 text-white"
                      : result.status === "DEAD" ? "bg-red-500 text-white"
                      : "bg-yellow-500 text-black"}`}>
                      {result.status}
                    </span>
                  </div>
                </div>
                <div className={`text-xs font-mono px-3 py-2 rounded mb-4 ${
                  result.status === "LIVE" ? "bg-green-800/40 text-green-300"
                  : result.status === "DEAD" ? "bg-red-800/40 text-red-300"
                  : "bg-yellow-800/40 text-yellow-300"}`}>
                  {result.responseCode} — {result.responseMessage}
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ["Card Number", result.cardNumber],
                    ["BIN / First 6", result.firstSix],
                    ["Expiry", result.expiry],
                    ["Network", result.type],
                    ["Category", result.category],
                    ["Issuing Bank", result.bank],
                    ["Card Level", result.level],
                    ["Country", result.country],
                    ["Balance", result.balance],
                    ["Currency", result.currencyCode],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1 border-b border-gray-700/50">
                      <span className="text-gray-400">{label}</span>
                      <span className={
                        label === "Balance" && result.status === "LIVE" ? "text-green-400 font-bold"
                        : label === "Network" ? (
                          result.type === "VISA" ? "text-blue-400 font-semibold"
                          : result.type === "MASTERCARD" ? "text-orange-400 font-semibold"
                          : result.type === "AMEX" ? "text-cyan-400 font-semibold"
                          : result.type === "RUPAY" ? "text-green-400 font-semibold"
                          : "text-gray-300 font-semibold")
                        : label === "Card Level" ? "text-yellow-400"
                        : label === "Category" ? "text-purple-400"
                        : label === "BIN / First 6" ? "text-blue-400 font-mono"
                        : label === "Card Number" ? "font-mono"
                        : ""}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
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
                <div className="flex gap-1 text-xs flex-wrap justify-end">
                  <span className="bg-green-600 px-2 py-1 rounded">✅ {liveCount}</span>
                  <span className="bg-red-600 px-2 py-1 rounded">❌ {deadCount}</span>
                  <span className="bg-yellow-600 text-black px-2 py-1 rounded">⚠️ {unknownCount}</span>
                  <span className="bg-gray-600 px-2 py-1 rounded">⛔ {invalidCount}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Format: <span className="text-blue-400 font-mono">CardNumber|MM/YY|CVV</span> — CVV required, one per line
            </p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={`4111111111111111|01/30|123\n5200000000000007|06/27|321\n4532015112830366|09/28|456`}
              className="w-full p-3 bg-gray-700 rounded text-sm font-mono resize-none outline-none mb-3"
              rows={5}
            />
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleBulkCheck}
                disabled={bulkChecking}
                className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold disabled:opacity-50"
              >
                {bulkChecking
                  ? `⏳ ${bulkProgress}/${bulkInput.trim().split("\n").filter(l => l.trim()).length}...`
                  : "🔍 Bulk Check"}
              </button>
              <button onClick={clearBulk} className="bg-gray-600 hover:bg-gray-500 px-4 rounded">Clear</button>
            </div>
            {bulkChecking && (
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(bulkProgress / Math.max(1, bulkInput.trim().split("\n").filter(l => l.trim()).length)) * 100}%` }}
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-96">
              {bulkResults.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  r.status === "LIVE" ? "border-green-500 bg-green-900/20"
                  : r.status === "DEAD" ? "border-red-500 bg-red-900/20"
                  : r.status === "INVALID" ? "border-gray-500 bg-gray-700/30"
                  : "border-yellow-500 bg-yellow-900/20"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs text-gray-200">{r.cardNumber || r.raw}</span>
                      <span className="text-xs text-gray-400">
                        {r.status !== "INVALID"
                          ? `${r.expiry} • ${r.type} • ${r.category} • ${r.bank}`
                          : "Invalid card details"}
                      </span>
                      {r.status !== "INVALID" && (
                        <span className="text-xs text-gray-500">{r.country}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {r.status === "LIVE" && (
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-sm whitespace-nowrap">{r.balance}</div>
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
                  <div className="mt-1 text-xs font-mono text-gray-500">
                    RC: {r.responseCode} — {r.responseMessage}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BIN VALIDATOR */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">BIN Validator</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Enter BIN (4-6 digits)"
              value={bin}
              maxLength={6}
              className="flex-1 p-3 rounded bg-gray-700 outline-none font-mono"
              onChange={(e) => { setBinResult(null); setBin(e.target.value.replace(/\D/g, "")) }}
            />
            <button onClick={handleBinCheck} className="bg-green-600 hover:bg-green-700 px-6 rounded font-semibold">
              Check BIN
            </button>
          </div>
          {binResult && (
            <div className="grid grid-cols-4 gap-4 text-sm">
              {[
                ["BIN", binResult.bin],
                ["Bank", binResult.bank],
                ["Scheme", binResult.scheme],
                ["Category", binResult.category],
                ["Level", binResult.level],
                ["Country", binResult.country],
                ["Currency", binResult.currency],
                ["Checked At", binResult.checkedAt],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-700 p-3 rounded">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>
          )}
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
