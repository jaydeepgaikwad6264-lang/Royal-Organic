export function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatUSD = formatINR

export function priceForOption(price: number, subscriptionPrice: number, option: 'onetime' | 'subscription') {
  return option === 'subscription' ? subscriptionPrice : price
}
