import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/upload(.*)',
  '/presentation(.*)',
  '/outline(.*)',
  '/custom-template(.*)',
  '/template-preview(.*)',
  '/documents-preview(.*)',
  '/pdf-maker(.*)',
  '/settings(.*)',
  '/setup(.*)',
  '/account(.*)'
])

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtected(req)) {
      await auth.protect()
    }
  },
  { debug: process.env.NODE_ENV === 'development' }
)

export const config = {
  matcher: [
    // From Clerk docs: match all except static and api, and include api/trpc explicitly
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ],
}



