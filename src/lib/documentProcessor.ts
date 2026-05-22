import pdf from 'pdf-parse';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const DocumentProcessor = {
  async extractTextFromUrl(url: string): Promise<string> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const data = await pdf(response.data);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to parse CV');
    }
  },

  async generateTailoredResume(userId: string, tailoredContent: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `resume_${userId}_${uuidv4()}.pdf`;
        const filePath = path.join(process.cwd(), 'public', 'deliverables', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // --- Designer Layout ---
        
        // Header / Name Placeholder
        doc.fillColor('#2563eb')
           .fontSize(24)
           .text('PROFESSIONAL PROFILE', { align: 'center' });
        
        doc.moveDown();
        doc.strokeColor('#e5e7eb')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
        
        doc.moveDown();

        // Content Sections
        const lines = tailoredContent.split('\n');
        lines.forEach(line => {
          if (line.toUpperCase() === line && line.length > 3 && line.length < 30) {
            // Section Header
            doc.moveDown()
               .fillColor('#1e40af')
               .fontSize(14)
               .text(line, { underline: true });
            doc.moveDown(0.5);
          } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
            // Bullet points
            doc.fillColor('#374151')
               .fontSize(10)
               .list([line.replace(/^[-•]\s*/, '')], { bulletRadius: 2, indent: 20 });
          } else {
            // Body text
            doc.fillColor('#374151')
               .fontSize(10)
               .text(line, { align: 'justify', lineGap: 2 });
          }
        });

        doc.end();
        stream.on('finish', () => resolve(fileName));
      } catch (error) {
        reject(error);
      }
    });
  }
};
