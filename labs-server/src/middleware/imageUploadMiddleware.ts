import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

class ImageFormatError extends Error {}

const uploadDir = process.env.IMAGE_UPLOAD_DIR || "uploads";

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (![".jpg", ".jpeg", ".png"].includes(fileExtension)) {
            return cb(new ImageFormatError("Unsupported image type"), "");
        }

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err);
}
