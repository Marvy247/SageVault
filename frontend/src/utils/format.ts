export function formatUSD(value: number | bigint, decimals = 2): string {
  const num = typeof value === 'bigint' ? Number(value) / 1e6 : value;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(decimals)}`;
}

export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

export function formatBigInt(value: bigint | undefined, decimals = 6, displayDecimals = 4): string {
  if (!value) return '0.0000';
  const num = Number(value) / Math.pow(10, decimals);
  return num.toFixed(displayDecimals);
}

export function parseToBigInt(value: string, decimals = 6): bigint {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 0n;
  return BigInt(Math.floor(num * Math.pow(10, decimals)));
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function projectYield(principal: number, monthlyDeposit: number, apyPercent: number, months: number): number[] {
  const monthlyRate = apyPercent / 100 / 12;
  const points: number[] = [];
  let balance = principal;
  for (let i = 0; i <= months; i++) {
    points.push(parseFloat(balance.toFixed(2)));
    balance = balance * (1 + monthlyRate) + monthlyDeposit;
  }
  return points;
}
