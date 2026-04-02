export function formatTokenAmount(
  amountBaseUnits: string,
  decimals: number,
): string {
  const amount = Number(amountBaseUnits);

  if (!Number.isFinite(amount)) {
    return '0';
  }

  return (amount / 10 ** decimals).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}