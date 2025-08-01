import express from "express";
import multer from "multer";

import {
  uploadFile,
  getFiles,
  getSignedUrl,
} from "../controllers/file.controller.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), uploadFile);

router.get("/", getFiles);
router.get("/signed-url/:id", getSignedUrl);

export default router;
