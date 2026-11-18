
import express from "express"
import cors from "cors"
import helmet from "helmet"

import { keys } from "./config/env.js"
import { connectToDB } from "./config/mongodb.js"

import authRoutes from "./client/routes/authRoutes.js"
import userRoutes from "./client/routes/userRoutes.js"
import topicRoutes from "./client/routes/topicRoutes.js"
import articleRoutes from "./client/routes/articleRoutes.js"

import adminRoutes from "./admin/routes/index.js"
import resumeRoutes from "./resume/routes/resumeRoutes.js"

import { errorHandler } from "./shared/errorHandler.js"

const app = express()

// Security and middleware
app.disable("x-powered-by")
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}))

const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

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

// Health check
app.get("/api/health", async (req, res) => {
    try {
        await connectToDB()

        res.json({
            status: "ok",
            environment: keys.server.environment,
            database: "connected",
        })
    } catch (error) {
        console.error("Health check: database unavailable:", error)

        res.json({
            status: "ok",
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

// Global error handler
app.use(errorHandler)

export default app
