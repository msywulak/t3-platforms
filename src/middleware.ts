import { authMiddleware } from "@clerk/nextjs";
import { env } from "@/env.mjs";
import { NextResponse } from "next/server";
// import { generateRandomString } from "@/lib/utils";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/uploadthing(.*)",
    "/api/domain(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/sso-callback(.*)",
  ],
  apiRoutes: ["/api(.*)"],
  afterAuth(auth, req) {
    const url = req.nextUrl;

    // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
    const hostname = req.headers
      .get("host")!
      .replace(".localhost:3000", `.${env.NEXT_PUBLIC_ROOT_DOMAIN}`);

    const searchParams = req.nextUrl.searchParams.toString();
    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ""
    }`;
    const pathname = req.nextUrl.pathname;
    // const domain = req.nextUrl.basePath;

    // console.log(`
    // ~~~~ authMiddleware ${generateRandomString(8)} ~~~~
    // href: ${url.href}
    // domain: ${domain}
    // hostname: ${hostname}
    // searchParams: ${searchParams}
    // path: ${path}
    // pathname: ${pathname}
    // authUser: ${auth.userId}
    // ~~~~ authMiddleware ~~~~
    // `);

    // bypass rewrite for api routes
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // rewrite for app pages
    if (hostname === `app.${env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
      if (
        !auth.userId &&
        pathname !== "/sign-in" &&
        pathname !== "/sign-up" &&
        pathname !== "/sso-callback"
      ) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      } else if (
        auth.userId &&
        (pathname === "/sign-in" ?? pathname === "/sign-up")
      ) {
        // console.log("redirecting to /");
        return NextResponse.redirect(new URL("/", req.url));
      }
      // console.log(`rewriting to /app${path === "/" ? "" : path}`);
      return NextResponse.rewrite(
        new URL(`/app${path === "/" ? "" : path}`, req.url),
      );
    }

    // rewrite root appllication `/home` folder
    if (
      hostname === "localhost:3000" ||
      hostname === env.NEXT_PUBLIC_ROOT_DOMAIN ||
      hostname.endsWith(".vercel.app") // vercel domain
    ) {
      return NextResponse.rewrite(
        new URL(`/home${path === "/" ? "" : path}`, req.url),
      );
    }

    // rewrite everything else to `/[domain]/[slug]` dynamic route
    // console.log(`rewriting to /${hostname}${path}`, req.url);
    return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
  },
});
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
