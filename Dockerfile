FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 7860
CMD ["./start.sh"]