import type { Worker } from 'bullmq'
import { ollamaWorker } from './ollama.worker'
import { fileProcessingWorker } from './file-processing.worker'

const workers: Worker[] = [ollamaWorker, fileProcessingWorker]

console.log(`[workers] registered: ${workers.length}`)

const shutdown = async (signal: string): Promise<void> => {
    console.log(`[workers] ${signal} received, closing...`)
    try {
        await Promise.all(workers.map((w) => w.close()))
        console.log('[workers] all closed gracefully')
        process.exit(0)
    } catch (err) {
        console.error('[workers] shutdown error:', err)
        process.exit(1)
    }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
