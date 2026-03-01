import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/explore(.*)",
  "/property/(.*)",
  "/how-to-use",
  "/become-a-host",
  "/recommendations",
  "/privacy",
  "/terms",
  "/api/properties(.*)",
  "/api/tags(.*)",
  "/api/filters(.*)",
  "/api/availability(.*)",
  "/login(.*)",
  "/signup(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
