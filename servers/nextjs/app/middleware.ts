import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/(presentation-generator)(.*)", "/dashboard(.*)", "/presentation(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) return Response.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api).*)",
  ],
};


