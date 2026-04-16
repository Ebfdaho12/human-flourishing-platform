import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/login" },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/wallet/:path*",
    "/settings/:path*",
    "/foundation/:path*",
    "/health/:path*",
    "/education/:path*",
    "/governance/:path*",
    "/energy/:path*",
    "/desci/:path*",
    "/economics/:path*",
    "/infrastructure/:path*",
    "/mental-health/:path*",
  ],
}
