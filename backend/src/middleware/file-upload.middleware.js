
import multer from "multer";
import path from "node:path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const allowedExtensions = [".pdf", ".docx"];

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream"
];

export class FileUploadError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "FileUploadError";
    this.statusCode = statusCode;
  }
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 1,
    parts: 2
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new FileUploadError("Only PDF and DOCX files are supported.")
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new FileUploadError("Invalid file type.")
      );
    }

    callback(null, true);
  }
});

export function uploadSingleDocument(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "File size cannot exceed 10 MB."
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error instanceof FileUploadError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return next(error);
  });
}
