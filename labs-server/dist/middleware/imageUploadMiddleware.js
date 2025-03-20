"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageMiddlewareFactory = void 0;
exports.handleImageFileErrors = handleImageFileErrors;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ImageFormatError extends Error {
}
const uploadDir = process.env.IMAGE_UPLOAD_DIR || "uploads";
// Ensure the uploads directory exists
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storageEngine = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
        if (![".jpg", ".jpeg", ".png"].includes(fileExtension)) {
            return cb(new ImageFormatError("Unsupported image type"), "");
        }
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
        cb(null, fileName);
    }
});
exports.imageMiddlewareFactory = (0, multer_1.default)({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});
function handleImageFileErrors(err, req, res, next) {
    if (err instanceof multer_1.default.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err);
}
