import { createWorker } from '../lib/worker.factory'
import { ollamaService } from '../services/ollama.service'
import type { OllamaJobData, OllamaJobResult } from '../queues/ollama.queue'

export const ollamaWorker = createWorker<OllamaJobData, OllamaJobResult>(
    'ollama',
    async (job) => {
        const start = Date.now()

        await job.updateProgress({ stage: 'calling-ollama', message: 'Отправляю запрос в Ollama' })
        const response = await ollamaService.generateMessage(job.data.prompt)

        await job.updateProgress({ stage: 'done', message: 'Готово' })

        return {
            response,
            workedFor: Date.now() - start,
        }
    }
)
