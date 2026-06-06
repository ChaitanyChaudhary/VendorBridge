/**
 * Format a number as Indian Rupees (₹) with locale formatting.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as a short label in lakhs/crores
 */
export function formatINRShort(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return formatINR(amount);
}

/**
 * GST rate constant
 */
export const GST_RATE = 0.18; // 18%

/**
 * Calculate GST amounts
 */
export function calculateGST(subtotal: number) {
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const totalGst = cgst + sgst;
  const grandTotal = subtotal + totalGst;
  return { subtotal, cgst, sgst, totalGst, grandTotal };
}
