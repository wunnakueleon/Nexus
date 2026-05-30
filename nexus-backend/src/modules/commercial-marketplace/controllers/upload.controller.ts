import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Files are saved on disk here; the DB only stores the URL that points to them.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads", "listings");

// Ensure the folder exists before multer tries to write to it
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// POST /commercial-marketplace/uploads — returns public URLs for the saved files
export const uploadImages = (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) {
    res.status(400).json({ message: "No images uploaded" });
    return;
  }

  const base = `${req.protocol}://${req.get("host")}/api/commercial-marketplace/uploads`;
  const urls = files.map((f) => `${base}/${f.filename}`);
  res.status(201).json({ urls });
};
