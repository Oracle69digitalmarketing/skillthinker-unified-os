import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const VoiceProcessor = {
  async transcribeAudio(mediaUrl: string): Promise<string> {
    try {
      // 1. Download the audio from Twilio
      const response = await axios.get(mediaUrl, { responseType: 'stream' });
      const tempPath = path.join(process.cwd(), 'temp', `${uuidv4()}.ogg`);
      
      if (!fs.existsSync(path.dirname(tempPath))) {
        fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      }

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // 2. Send to Groq Whisper
      const form = new FormData();
      form.append('file', fs.createReadStream(tempPath));
      form.append('model', 'whisper-large-v3');

      const groqResponse = await axios.post(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          }
        }
      );

      // Cleanup
      fs.unlinkSync(tempPath);

      return groqResponse.data.text;
    } catch (error) {
      console.error('Error in VoiceProcessor:', error);
      throw new Error('Failed to transcribe audio');
    }
  }
};
