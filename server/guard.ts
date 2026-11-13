import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/admin");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/");
  return session;
}
