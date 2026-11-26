import mongoose from "mongoose"
import { assertConfig, keys } from "./config/env.js"
import { connectToDB } from "./config/database.js"
import { startResumeWorker, stopResumeWorker } from "./jobs/resume/worker.js"
import app from "./app.js"

const port = Number(keys.server.port)

async function start() {
    // Fail before binding a port when the API cannot possibly serve requests.
    assertConfig()

    await connectToDB()
    console.log("MongoDB connected")

    // Resume reviews are consumed by a BullMQ worker. Running it in-process
    // keeps a single deployment simple; `npm run worker` can host it instead.
    await startResumeWorker()

    const server = app.listen(port, () => {
        console.log(`Server running on port ${port} (${keys.server.environment})`)
    })

    let closing = false
    const shutdown = (reason, code = 0) => {
        if (closing) return
        closing = true
        console.log(`${reason} received, shutting down`)
        server.close(() => {
            Promise.all([stopResumeWorker()])
                .catch(() => {})
                .then(() => mongoose.connection.close())
                .finally(() => process.exit(code))
        })
    }

    process.on("SIGINT", () => shutdown("SIGINT"))
    process.on("SIGTERM", () => shutdown("SIGTERM"))
    process.on("unhandledRejection", (reason) => {
        console.error("Unhandled rejection:", reason)
        shutdown("Unhandled rejection", 1)
    })
}

start().catch((error) => {
    console.error("Failed to start server:", error.message)
    process.exit(1)
})
