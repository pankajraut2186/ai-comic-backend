import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/generate", upload.single("refImage"), async (req, res) => {
  try {
    const {
      prompt = "",
      style = "comic book",
      characterRef = "",
      dialogue = "",
      mode = "single",
      controlType = "reference",
    } = req.body;

    const fullPrompt = `${style} style, ${prompt}, character: ${characterRef}`;

    const stabilityResponse = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        prompt: fullPrompt,
        output_format: "png",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(stabilityResponse.data, "binary").toString("base64");

    res.json({
      imageBase64: `data:image/png;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Image generation failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
