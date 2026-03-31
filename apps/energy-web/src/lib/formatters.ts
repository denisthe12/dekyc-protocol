export function formatKzte(baseUnits: number): string {
  return (baseUnits / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}