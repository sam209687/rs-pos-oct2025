// ./middleware.ts
import { auth as middleware } from "./lib/auth";

// ✅ FIX: Temporarily disable the middleware by commenting out the config object.
export const config = {
  matcher: ["/admin/:path*", "/cashier/:path*"],
};

export { middleware };