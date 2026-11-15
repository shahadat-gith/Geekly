# Cloudflare Workers deployment

The client and admin are separate Vite single-page applications and deploy as **two separate Workers**. Each has its own `wrangler.jsonc`, Worker entry point, `dist/` asset directory, and SPA fallback. The client Worker uses the custom domain `https://geekly.in`; the admin Worker uses `https://admin.geekly.in`. These configs do not put the admin under `/admin` on the client Worker. Both domains must be in the Cloudflare zone, and conflicting DNS records must be removed before deployment so Wrangler can attach the custom domains.

## Deploy the client

1. In `client/`, create an untracked `.env.production` based on `.env.example` and set `VITE_API_URL` to the public HTTPS origin of the Geekly API, without a trailing slash.
2. Run:

   ```sh
   npm install
   npm run deploy
   ```

## Deploy the admin

1. In `admin/`, create an untracked `.env.production` containing `VITE_API_URL` set to the same reachable API origin.
2. Run:

   ```sh
   npm install
   npm run deploy
   ```

Wrangler prompts for Cloudflare authentication on first deployment. To test a Worker locally after building, run `npx wrangler dev` from its frontend directory.

## API and authentication requirements

The existing `server/` is an Express/Mongoose API, not a Workers-compatible Worker. It must remain deployed on a Node-compatible host with its MongoDB connection, secrets, OAuth credentials, and R2 credentials configured; these frontend Worker configs do not deploy or migrate it. Set both frontend `VITE_API_URL` values to that API's public HTTPS origin before building. Vite embeds this value into the frontend bundle.

On the API host, set `FRONTEND_URL=https://geekly.in` and `ADMIN_URL=https://admin.geekly.in`, and add both origins to `CORS_ORIGINS` (comma-separated) if they are not already covered. Update Google/GitHub callback URLs in their provider consoles to the API origin's `/auth/google/callback` and `/auth/github/callback`, and set matching `GOOGLE_CALLBACK_URL` and `GITHUB_CALLBACK_URL` on the API. OAuth returns users to the configured frontend/admin origins.

Never put API secrets, MongoDB credentials, JWT secrets, OAuth client secrets, or R2 credentials in either Vite environment file: all `VITE_*` values are public in the browser bundle.