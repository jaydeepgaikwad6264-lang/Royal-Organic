export function formatUSD(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatINR = formatUSD

export function priceForOption(price: number, subscriptionPrice: number, option: 'onetime' | 'subscription') {
  return option === 'subscription' ? subscriptionPrice : price
}
