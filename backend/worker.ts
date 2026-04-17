import 'dotenv/config'
import './workers'
import { cleanupService } from './services/cleanup.service'

console.log('[worker] process started, PID:', process.pid)

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000

const runCleanup = async (): Promise<void> => {
    try {
        const { orphans, stale } = await cleanupService.runAll()
        if (orphans || stale) {
            console.log(`[cleanup] orphans=${orphans} stale=${stale}`)
        }
    } catch (err) {
        console.error('[cleanup] failed:', err)
    }
}

setInterval(runCleanup, CLEANUP_INTERVAL_MS)
runCleanup()
