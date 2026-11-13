export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/hesap/:path*", "/odeme/:path*"],
};
