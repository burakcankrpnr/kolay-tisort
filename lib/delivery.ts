/** İş günü ekleyerek tahmini teslim tarihini hesaplar (hafta sonu atlanır). */
export function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let left = days;
  while (left > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return date;
}

const longDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" });

/** Üretim + kargo (anlaşmalı firmalarda en hızlı 1, en yavaş 5 iş günü) için takvim tarihi aralığı. */
export function deliveryWindow(productionDays: number, from = new Date()) {
  const earliest = addBusinessDays(from, productionDays + 1);
  const latest = addBusinessDays(from, productionDays + 5);
  return { earliest: longDate.format(earliest), latest: longDate.format(latest) };
}
