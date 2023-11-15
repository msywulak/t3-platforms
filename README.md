# [T3 Platforms](https://t3-platforms.com)

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Introduction

The primary purpose of this repo was to help me learn how the [Vercel Platform Start Kit](https://github.com/vercel/platforms) works from the ground up. While the basis isn't a direct fork I did copy a lot then rewrite using different technologies from the T3 stack, though towards the end Drizzle, PlanetScale, and Clerk are the ones that remain.

This is still a work in progress with a non exhaustive and unordered list of items I'll be working towards soon.
- [ ] Finish Platforms migration to "T3" style
- [ ] Styling on dynamic site pages
- [ ] Fix Clerk Sign-up Redirect Flow
- [ ] Optionally protect dynamic site pages with Clerk Organizations
- [ ] Hook up Clerk Webhook plumbing to PlanetScale User Table
- [ ] See if there's anything I can do with Clerk Metadata based on this [article](https://clerk.com/blog/exploring-clerk-metadata-stripe-webhooks)

## Tech Stack
- [Next.js](https://nextjs.org/) as the React framework
- [Vercel](https://vercel.com) for deployment
- [Tailwind CSS](https://tailwindcss.com/) for CSS styling
- [Clerk](https://clerk.com/) for authentication
- [Drizzle ORM](https://orm.drizzle.team/) as the ORM for database access
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [next-safe-action](https://next-safe-action.dev/) for type safe server actions
- [Uploadthing](https://uploadthing.com/) for image uploads
- [Recharts](https://recharts.org/) for charts
- [Novel](https://novel.sh/) for the WYSIWYG editor

## Running Locally
1. Clone the repository
```
git clone https://github.com/msywulak/t3-platforms.git
```
2. Install dependencies using pnpm
```
pnpm install
```
3. Copy `.env.example` to `.env` and update the variables
- `NEXT_PUBLIC_ROOT_DOMAIN`: This is the domain of your app (e.g. `t3-platforms.com`)
- `AUTH_BEARER_TOKEN`: This is your Vercel authentication token that can be found [here](https://vercel.com/account/tokens).
- `PROJECT_ID_VERCEL`: This is your Vercel Project ID that can be found in your Vercel Project settings page (https://vercel.com/<org>/<project>/settings). Since you haven't deployed your project to Vercel yet, you can leave this blank for now but remember to come back to add this after you've completed Step 5.
- `TEAM_ID_VERCEL` Optional (You'll only be able to add 50 custom domains on the [free tier](https://vercel.com/pricing#:~:text=Domains%20per%20Project-,50,-Unlimited), if omitted you'll need to comment it out in the `env.mjs` file: This is your Vercel Team ID that can be found in your Vercel Team settings page (https://vercel.com/<org>/settings)
- `OPENAI_API_KEY` Optional (you'll need to add yourself): Required for AI text generation in the text editor. [Get one here](https://platform.openai.com/account/api-keys).
```
cp .env.example .env
```
4. Start the development server
```
pnpm run dev
```
5. Push database schema
```
pnpm run db:push
```
## Deploying to Vercel
1. First, create a new Github repository and push your local changes.
2. [Deploy it to Vercel](https://vercel.com/docs/concepts/deployments/git#deploying-a-git-repository) Ensure you add all environment variables that you configured earlier to Vercel during the import process.
3. In your Vercel project, add your [root domain & wildcard domain](https://vercel.com/docs/concepts/projects/custom-domains#wildcard-domains).
    - When adding your custom domain, ignore the recommended step to "add the www. version of your domain and redirect your root domain to it" – just add the root domain.
    - To set up wildcard domains, you'll need to add the domain using the Nameservers method (as opposed to the recommended A records method).
  
Read the rest of the caveats from Vercel [here](https://vercel.com/guides/nextjs-multi-tenant-application)

## Credits
Heavy inspiration and code use from [@sadmann17](https://twitter.com/sadmann17). The custom file uploader in particular helped me understand Uploadthing a bit more.
- [skateshop](https://github.com/sadmann7/skateshop)
- [Vercel Platform Start Kit](https://github.com/vercel/platforms)
