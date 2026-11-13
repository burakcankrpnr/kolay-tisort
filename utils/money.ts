const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

const dateTime = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "long",
  timeStyle: "short",
});

export function formatTry(kurus: number) {
  return money.format(kurus / 100);
}

export function formatDate(value: Date) {
  return dateTime.format(value);
}
