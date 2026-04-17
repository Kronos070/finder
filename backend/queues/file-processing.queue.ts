import { createQueue } from "../lib/queue.factory";

export type FileProcessingJobData = {
    fileId: string;
    s3Key: string;
    filename: string;
};

export type FileProcessingJobResult = {
    summary: string;
    tags: string[];
};

export type FileProcessingStage =
    | "extracting"
    | "summarizing"
    | "saving"
    | "done";

export const fileProcessingQueue = createQueue<
    FileProcessingJobData,
    FileProcessingJobResult
>("file-processing");
