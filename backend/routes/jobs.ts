import { Router, Request, Response } from 'express'
import { queueRegistry } from '../lib/queue.factory'
import { JobStatusResponse, JobProgress } from '../types/queues'

const jobsRouter = Router()

jobsRouter.get('/:queue/:id', async (req: Request, res: Response) => {
    const { queue: queueName, id } = req.params

    const queue = queueRegistry.get(queueName)
    if (!queue) {
        return res.status(404).json({ error: `Queue "${queueName}" not found` })
    }

    try {
        const job = await queue.getJob(id)
        if (!job) {
            return res.status(404).json({ error: `Job "${id}" not found` })
        }

        const state = await job.getState()

        const response: JobStatusResponse = {
            id: job.id ?? id,
            status: state as JobStatusResponse['status'],
            progress: (job.progress as JobProgress) || null,
            result: job.returnvalue ?? null,
            failedReason: job.failedReason ?? null,
            createdAt: job.timestamp ?? null,
            processedAt: job.processedOn ?? null,
            finishedAt: job.finishedOn ?? null,
        }

        return res.json(response)
    } catch (err) {
        console.error('[jobs] error:', err)
        return res.status(500).json({ error: 'Failed to fetch job status' })
    }
})

export default jobsRouter
