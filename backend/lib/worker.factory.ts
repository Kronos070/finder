import { Worker, WorkerOptions, Processor } from 'bullmq'
import { redis } from './redis'

export function createWorker<TData = unknown, TResult = unknown>(
    name: string,
    processor: Processor<TData, TResult>,
    options?: Partial<WorkerOptions>
): Worker<TData, TResult> {
    const worker = new Worker<TData, TResult>(name, processor, {
        connection: redis,
        concurrency: 1,
        ...options,
    })

    worker.on('completed', (job) => {
        console.log(`[${name}] completed ${job.id}`)
    })
    worker.on('failed', (job, err) => {
        console.error(`[${name}] failed ${job?.id}:`, err.message)
    })
    worker.on('error', (err) => {
        console.error(`[${name}] error:`, err.message)
    })

    return worker
}
