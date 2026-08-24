export const USD_TO_INR = 83;

export const formatCurrency = (amountInUSD) => {
  if (amountInUSD === undefined || amountInUSD === null || isNaN(amountInUSD)) return '₹0';
  const amountInINR = amountInUSD * USD_TO_INR;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amountInINR);
};
