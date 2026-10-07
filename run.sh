#!/bin/bash

# เพิ่ม Node.js เข้า PATH
export PATH="$HOME/.nodejs/bin:$PATH"

# ตรวจสอบว่า MySQL รันอยู่หรือไม่ ถ้ายังไม่รัน ให้เริ่มรัน
if ! nc -z 127.0.0.1 3306 2>/dev/null; then
  echo "🚀 กำลังเริ่มต้น MySQL Server..."
  nohup /Applications/XAMPP/xamppfiles/sbin/mysqld --defaults-file=$HOME/.mariadb_config/my.cnf >/dev/null 2>&1 &
  sleep 2
fi

echo "✅ MySQL Server พร้อมใช้งานบนพอร์ต 3306"
echo "🌐 กำลังเปิด Next.js Web Server..."
npm run dev
