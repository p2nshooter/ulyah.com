/**
 * The ulyah.com donation accounts — shown on /donasi (components/CryptoDonationSection.tsx) and published as
 * /donation-accounts.json so the owner's other sites (axto.io, xaa.es) import exactly the same public receiving
 * details into their encrypted payment stores instead of keeping their own copy (owner, 27 Oct 2026).
 */
export const WALLETS = [
  { id: "btc", coin: "Bitcoin", symbol: "BTC", network: "Bitcoin", address: "1AzqohLY6XPGbabHmMhstYMPFUThoiBnya" },
  { id: "usdt-trc20", coin: "Tether USDt", symbol: "USDT", network: "TRC20 (Tron)", address: "TNo8jgJqmnUGAPUDb159cC8uhAeFDP8keW" },
  { id: "bnb-bep20", coin: "BNB", symbol: "BNB", network: "BEP20 (BNB Smart Chain)", address: "0x1bed722b27b3d2bdab3dfe06ea75b84a3a824f3d" },
  { id: "sol", coin: "Solana", symbol: "SOL", network: "Solana", address: "CUnEGFRZvMu8xieLdiM9oHXa5dzS9xJVvNnEiyXRaogD" },
  { id: "doge", coin: "Dogecoin", symbol: "DOGE", network: "Dogecoin", address: "DJUK77iDsus6URWcwNZnsqAyESUr426Df3" },
];

// wondr by BNI multicurrency accounts — a.n. Yusron Efendi
export const BANK_ACCOUNTS = [
  { ccy: "IDR", number: "2090571484" },
  { ccy: "USD", number: "2090571495" },
  { ccy: "SGD", number: "2090571508" },
  { ccy: "AUD", number: "2090571519" },
  { ccy: "GBP", number: "2090571520" },
  { ccy: "CNY", number: "2090571531" },
  { ccy: "EUR", number: "2090571542" },
  { ccy: "HKD", number: "2090571553" },
  { ccy: "JPY", number: "2090571564" },
  { ccy: "MYR", number: "2090571575" },
  { ccy: "SAR", number: "2090571586" },
  { ccy: "KRW", number: "2090571597" },
  { ccy: "THB", number: "2090571609" },
];

export const BANK = {
  name: "PT Bank Negara Indonesia (Persero) Tbk. — wondr by BNI",
  holder: "YUSRON EFENDI",
  swift: "BNINIDJA",
  code: "009",
  country: "Indonesia",
};
