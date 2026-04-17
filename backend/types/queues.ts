export type JobProgress = {
    stage: string
    message?: string
    percent?: number
}

export type JobStatus =
    | 'waiting'
    | 'active'
    | 'completed'
    | 'failed'
    | 'delayed'
    | 'unknown'

export type JobStatusResponse<TResult = unknown> = {
    id: string
    status: JobStatus
    progress: JobProgress | null
    result: TResult | null
    failedReason: string | null
    createdAt: number | null
    processedAt: number | null
    finishedAt: number | null
}
