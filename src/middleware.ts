// ./middleware.ts
export { auth as middleware } from "./lib/auth";

// You can also add a matcher to protect specific routes
// export const config = {
//   matcher: ["/admin/:path*", "/cashier/:path*"], // Protect admin and cashier routes
// };