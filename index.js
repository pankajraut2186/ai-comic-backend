import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post('/api/generate', upload.single('refImage'), async (req, res) => {
  try {
    const { prompt, style, characterRef, dialogue, mode, controlType } = req.body;

    const image = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        prompt: `${style} style, ${prompt}, character: ${characterRef}`,
        output_format: 'png',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'application/json',
        }
      }
    );

    res.json({
      imageUrl: image.data.image,
      panels: mode === 'comic' ? [
        { imageUrl: image.data.image, dialogue: dialogue }
      ] : undefined
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Image generation failed.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
