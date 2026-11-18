import { config } from "dotenv"
config()

// SQS_<NAME>_QUEUE_URL / SQS_<NAME>_QUEUE_ARN -> { url, arn }. Both are
// optional: without a URL the application falls back to in-process work.
function sqsQueue(prefix) {
    return {
        url: (process.env[`SQS_${prefix}_QUEUE_URL`] || "").trim() || undefined,
        arn: (process.env[`SQS_${prefix}_QUEUE_ARN`] || "").trim() || undefined
    }
}

export const keys = {
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || "development"
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
    email: {
        resendApiKey: (process.env.RESEND_API_KEY || "").trim() || undefined
    },
    r2: {
        publicUrl: (process.env.R2_PUBLIC_URL || "").trim().replace(/\/$/, "") || undefined,
        accountId: (process.env.R2_ACCOUNT_ID || "").trim() || undefined,
        accessKeyId: (process.env.R2_ACCESS_KEY_ID || "").trim() || undefined,
        secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || "").trim() || undefined,
        bucketName: (process.env.R2_BUCKET_NAME || "").trim() || undefined
    },
    // Background queues. Long-running work (resume analysis, roadmap
    // generation, and whatever comes next) is queued instead of running inside
    // an API Gateway request. Each queue is one entry: sqs.<name> = { url, arn }.
    // Adding a queue means adding one line here plus its two env vars.
    sqs: {
        region: (process.env.AWS_REGION || "").trim() || "ap-south-1",
        resume: sqsQueue("RESUME_ANALYSIS")
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