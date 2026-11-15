import express from "express"
import cors from "cors"
import helmet from "helmet"
import { keys } from "./config/env.js"
import authRoutes from "./client/routes/authRoutes.js"
import oauthRoutes from "./client/routes/oauthRoutes.js"
import userRoutes from "./client/routes/userRoutes.js"
import adminRoutes from "./admin/routes/index.js"
import { asyncHandler } from "./shared/asyncHandler.js"
import { listParents } from "./client/controllers/topicController.js"
import { resolve as resolveContentPath } from "./client/controllers/contentController.js"
import { errorHandler } from "./shared/errorHandler.js"

const app = express()

app.disable("x-powered-by")
// The API is consumed by the frontend on a different origin, so resources
// must be readable cross-origin (helmet's default is same-origin, which
// makes browser fetches fail with "Failed to fetch").
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))

// Only the configured frontend may call the API from a browser. Extra
// origins can be allowlisted with CORS_ORIGINS (comma separated).
const allowedOrigins = [
    keys.auth.frontendUrl,
    keys.auth.adminUrl,
    ...(process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()),
].filter(Boolean)

app.use(cors({
    origin(origin, callback) {
        // No Origin header: server-to-server, curl, health checks.
        if (!origin) return callback(null, true)
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
}))
// Rich-text article bodies are larger than a typical JSON payload.
app.use(express.json({ limit: "1mb" }))

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", environment: keys.server.environment })
})

app.get("/api/topics/parents", asyncHandler(listParents))
app.get("/api/content", asyncHandler(resolveContentPath))

app.use("/api/auth", authRoutes)
app.use("/auth", oauthRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)

// 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

// Central error handler
app.use(errorHandler)

export default app
