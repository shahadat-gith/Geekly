
import express from "express"
import cors from "cors"
import helmet from "helmet"

import { keys } from "./config/env.js"
import { connectToDB } from "./config/database.js"

import authRoutes from "./features/public/auth/routes.js"
import userRoutes from "./features/public/users/routes.js"
import topicRoutes from "./features/public/topics/routes.js"
import articleRoutes from "./features/public/articles/routes.js"

import adminRoutes from "./features/admin/routes.js"
import hostingRoutes from "./features/hosting/hosting.routes.js"
import resumeRoutes from "./features/resume/resume.routes.js"

import { errorHandler } from "./shared/errorHandler.js"

const app = express()

// Security and middleware
app.disable("x-powered-by")
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}))

const { origins: allowedOrigins } = keys.cors

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error("Not allowed by CORS"))
    },
}))

app.use(express.json({ limit: "1mb" }))


app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is UP" })
})

// Readiness check: 503 when the database is unreachable, so an uptime monitor
// or a deploy never sees a healthy instance that cannot serve requests.
app.get("/api/health", async (_req, res) => {
    try {
        await connectToDB()

        res.json({
            status: "ok",
            environment: keys.server.environment,
            database: "connected",
        })
    } catch (error) {
        console.error("Health check: database unavailable:", error)

        res.status(503).json({
            status: "degraded",
            environment: keys.server.environment,
            database: "unavailable",
            databaseError: error.name || "Error",
        })
    }
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/topics", topicRoutes)
app.use("/api/articles", articleRoutes)
app.use("/api/resume-analysis", resumeRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/deployments", hostingRoutes)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

// Global error handler
app.use(errorHandler)

export default app
