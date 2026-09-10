const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatUSD(value: number): string {
  return usdFormatter.format(value);
}

export function formatInvestmentRange(
  minInvestment: number,
  maxInvestment: number,
  currency = 'USD',
): string {
  return `${formatUSD(minInvestment)} - ${formatUSD(maxInvestment)} ${currency}`;
}

export function formatRoyalty(percentage: number, type: string): string {
  return `${percentage}% ${type}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'ahora';
  }
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `hace ${days} d`;
  }
  return formatDateTime(iso);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}