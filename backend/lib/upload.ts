import multer from "multer";

const ALLOWED_EXT = /\.(docx?|DOCX?)$/;
const ALLOWED_MIME = new Set([
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
]);

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const extOk = ALLOWED_EXT.test(file.originalname);
        const mimeOk = ALLOWED_MIME.has(file.mimetype);
        if (!extOk || !mimeOk) {
            cb(new Error("Разрешены только файлы .doc и .docx"));
            return;
        }
        cb(null, true);
    },
});
