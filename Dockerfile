# เลือก Base Image (Node.js เวอร์ชัน LTS)
FROM node:20-alpine

# ติดตั้ง libc6-compat และ openssl สำหรับ Next.js และ Prisma บน Alpine
RUN apk add --no-cache libc6-compat openssl

# สร้าง Working Directory
WORKDIR /app

# Copy package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง Dependencies
RUN npm install

# Copy ไฟล์ Source Code ทั้งหมดไปยัง Working Directory
COPY . .

# สร้าง Prisma Client
RUN npx prisma generate

# กำหนดพอร์ตที่จะใช้งาน
EXPOSE 3000

# คำสั่งที่จะรันเมื่อ Container เริ่มทำงาน
CMD ["npm", "run", "dev"]