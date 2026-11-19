import { config } from "dotenv"
config()

export const keys = {
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || "development"
    },
    // Comma-separated origin allowlist. Empty means "allow any origin", which is
    // only appropriate for local development.
    cors: {
        origins: (process.env.CORS_ORIGINS || "")
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
    },
    db: {
        uri: process.env.MONGODB_URI
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        // Access tokens are short-lived; the refresh token keeps the session alive.
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        // Fall back to the main secret so existing deployments keep working.
        refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
    },
    admin: {
        email: (process.env.ADMIN_EMAIL || "").toLowerCase().trim() || undefined,
        password: process.env.ADMIN_PASSWORD || undefined
    },
    openrouter: {
        apiKey: (process.env.OPENROUTER_API_KEY || "").trim() || undefined
    },
    // AWS region used by SES (transactional email).
    aws: {
        region: (process.env.AWS_REGION || "").trim() || "ap-south-1"
    },
    redis: {
        url: (process.env.REDIS_URL || "").trim() || undefined
    },
    // Cloudflare: one account, one R2 credential pair, and every bucket and KV
    // namespace listed once. Hosting reads its buckets and KV from here too.
    cloudflare: {
        accountId: (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim() || undefined,
        apiToken: (process.env.CLOUDFLARE_API_TOKEN || "").trim() || undefined,
        r2: {
            accessKeyId: (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "").trim() || undefined,
            secretAccessKey: (process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "").trim() || undefined,
            publicUrl: (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").trim().replace(/\/$/, "") || undefined,
            buckets: {
                assets: (process.env.CLOUDFLARE_R2_ASSETS_BUCKET || "").trim() || undefined,
                deployments: (process.env.CLOUDFLARE_R2_DEPLOYMENTS_BUCKET || "geekly-deployments").trim()
            }
        },
        kv: {
            namespaceId: (process.env.CLOUDFLARE_KV_NAMESPACE_ID || "").trim() || undefined
        }
    },
    auth: {
        frontendUrl: process.env.FRONTEND_URL || "",
        // Admin console origin (Vite dev server defaults to 3002).
        adminUrl: process.env.ADMIN_URL || "http://localhost:3002",
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: process.env.GOOGLE_CALLBACK_URL
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackUrl: process.env.GITHUB_CALLBACK_URL
        }
    }
}

// Required settings stop the boot; optional integrations only warn, so a
// developer without R2 or OpenRouter keys can still run the API. Email uses SES
// with the instance's AWS credentials, so it has no key of its own to check.
const REQUIRED = {
    MONGODB_URI: () => keys.db.uri,
    JWT_SECRET: () => keys.jwt.secret
}

const OPTIONAL = [
    {
        name: "R2 storage",
        configured: () => Boolean(
            keys.cloudflare.r2.publicUrl && keys.cloudflare.accountId && keys.cloudflare.r2.accessKeyId &&
            keys.cloudflare.r2.secretAccessKey && keys.cloudflare.r2.buckets.assets
        )
    },
    { name: "OpenRouter (AI)", configured: () => Boolean(keys.openrouter.apiKey) },
    {
        name: "Admin console login",
        configured: () => Boolean(keys.admin.email && keys.admin.password)
    },
    { name: "Redis queue (BullMQ)", configured: () => Boolean(keys.redis.url) },
    {
        name: "Static site hosting",
        configured: () => Boolean(
            keys.cloudflare.accountId && keys.cloudflare.apiToken &&
            keys.cloudflare.kv.namespaceId && keys.cloudflare.r2.accessKeyId &&
            keys.cloudflare.r2.secretAccessKey
        )
    },
    {
        name: "OAuth login",
        configured: () => Boolean(
            (keys.auth.google.clientId && keys.auth.google.clientSecret) ||
            (keys.auth.github.clientId && keys.auth.github.clientSecret)
        )
    }
]

export function assertConfig() {
    const missing = Object.entries(REQUIRED)
        .filter(([, read]) => {
            const value = read()
            return typeof value !== "string" || !value.trim()
        })
        .map(([name]) => name)

    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    }

    const unconfigured = OPTIONAL.filter((item) => !item.configured()).map((item) => item.name)
    if (unconfigured.length) {
        console.warn(`[config] not configured: ${unconfigured.join(", ")}`)
    }
}