import { Queue, QueueOptions, JobsOptions } from 'bullmq'
import { redis } from './redis'

const defaultJobOptions: JobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600, count: 100 },
    removeOnFail: { age: 86400 },
}

export const queueRegistry = new Map<string, Queue>()

export function createQueue<TData = unknown, TResult = unknown>(
    name: string,
    options?: Partial<QueueOptions>
): Queue<TData, TResult> {
    const queue = new Queue<TData, TResult>(name, {
        connection: redis,
        defaultJobOptions,
        ...options,
    })
    queueRegistry.set(name, queue as unknown as Queue)
    return queue
}
