import { z } from "zod";

export const uploadFileSchema = z.object({
    parentId: z.string().uuid().nullable().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
