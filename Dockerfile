FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install && npm run build
RUN chmod +x start.sh
EXPOSE 7860
CMD ["bash", "start.sh"]
