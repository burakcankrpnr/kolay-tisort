export function safeCallback(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/hesap";
  return value;
}
