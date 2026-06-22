import express from 'express';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/analyze-issue', upload.single('media'), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We expect user to optionally pass more context
    const { userDescription } = req.body;
    let parts: any[] = [];
    
    if (req.file) {
      // Upload the file to Gemini via File API... wait wait.
      // Doing the whole file upload via File API can be slow. Since the hackathon might use short clips.
      // Converting to inlineData for images is faster. Let's assume it's just image for now.
      // But the genai SDK supports multiple things. To be safe, we can use Base64 if it's an image.
      const mimeType = req.file.mimetype;
      const fileBytes = fs.readFileSync(req.file.path);
      
      parts.push({
        inlineData: {
          data: fileBytes.toString("base64"),
          mimeType: mimeType
        }
      });
      // Try to clean up
      fs.unlinkSync(req.file.path);
    }
    
    const prompt = `
    Analyze this civic issue report.
    User provided description: "${userDescription || 'None'}"
    
    You need to output a JSON string containing the following:
    - title: A short, concise issue title.
    - description: A detailed description of the issue based on the image and user input.
    - severity: 'Critical', 'High', 'Medium', or 'Low'
    - risk: A numeric risk level between 1 and 10.
    - category: 'Roads', 'Water Supply', 'Waste Management', 'Electricity', 'Street Lighting', 'Public Safety', 'Drainage', or 'Other'
    - department: Suggested responsible municipal department.
    
    Only output the valid JSON object, without any markdown formatting wrappers or explanation.
    `;
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      return res.status(500).json({ error: 'Failed to generate analysis.' });
    }
    
    const data = JSON.parse(response.text);
    res.json(data);
  } catch (error: any) {
    console.error('Error analyzing issue:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
