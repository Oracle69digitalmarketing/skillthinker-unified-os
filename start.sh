#!/bin/bash

# Start the background worker using tsx
npx tsx src/workers/agentWorker.ts &

# Start the Next.js production server on the HF Spaces port (7860)
npm start -- -p 7860
