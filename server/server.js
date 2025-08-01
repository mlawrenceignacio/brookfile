import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import fileRoutes from "./routes/file.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/files", fileRoutes);

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nServer running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("\nMongoDB connection err: ", err);
  });
