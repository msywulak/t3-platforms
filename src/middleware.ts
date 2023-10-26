import { authMiddleware } from "@clerk/nextjs";
import { env } from "@/env.mjs";
import { NextResponse } from "next/server";
import { generateRandomString } from "@/lib/utils";

export default authMiddleware({
  publicRoutes: ["/", "/api/uploadthing", "/sign-in", "/sign-up"],
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

    console.log(`
    ~~~~ authMiddleware ${generateRandomString(8)} ~~~~
    href: ${url.href}
    hostname: ${hostname}
    searchParams: ${searchParams}
    path: ${path}
    pathname: ${pathname}
    ~~~~ authMiddleware ~~~~
    `);

    // rewrite for app pages
    if (hostname === `app.${env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
      if (!auth.session && pathname !== "/sign-in" && pathname !== "/sign-up") {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      } else if (
        auth.session &&
        (pathname === "/sign-in" ?? pathname === "/sign-up")
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.rewrite(
        new URL(`/app${path === "/" ? "" : path}`, req.url),
      );
    }

    // rewrite root appllication `/home` folder
    if (
      hostname === "localhost:3000" ||
      hostname === env.NEXT_PUBLIC_ROOT_DOMAIN ||
      hostname === `${env.PROJECT_ID_VERCEL}.vercel.app` // vercel domain
    ) {
      return NextResponse.rewrite(
        new URL(`/home${path === "/" ? "" : path}`, req.url),
      );
    }

    // rewrite everything else to `/[domain]/[slug]` dynamic route
    return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
  },
});
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
