import supabase from "../supabase/client.js";
import File from "../models/file.model.js";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = async (req, res) => {
  console.log("File received:", req.file);

  try {
    const { originalname, buffer, mimetype } = req.file;
    const filePath = `${uuidv4()}-${originalname}`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) return res.status(500).json({ error: error.message });

    const fileDoc = await File.create({
      filePath,
      fileName: originalname,
      mimeType: mimetype,
    });

    res.status(201).json(fileDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSignedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.query;

    console.log("Looking for file ID:", id);
    const file = await File.findById(id);
    if (!file) {
      console.log("No file found in MongoDB.");
      return res.status(404).json({ message: "File not found." });
    }

    console.log("Found file in DB:", file);
    console.log("Using bucket:", process.env.SUPABASE_BUCKET);
    console.log("File path to sign:", file.filePath);
    console.log("Action:", action);

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .createSignedUrl(file.filePath, 60 * 60, {
        download: action === "download",
      });

    if (error) {
      console.error("Error from Supabase:", error.message);
      return res.status(500).json({ message: error.message });
    }

    res
      .status(200)
      .json({ signedUrl: data.signedUrl, fileName: file.fileName });
  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).json({ error: error.message });
  }
};
