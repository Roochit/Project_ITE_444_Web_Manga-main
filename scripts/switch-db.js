const fs = require("fs");
const path = require("path");

const target = (process.argv[2] || "").toLowerCase();
const envPath = path.join(__dirname, "..", ".env");

if (!["xampp", "docker"].includes(target)) {
  console.log("วิธีใช้งาน: node scripts/switch-db.js [xampp|docker]");
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, "utf8");

const XAMPP_URL = 'DATABASE_URL="mysql://root:@127.0.0.1:3306/manga_db"';
const DOCKER_URL = 'DATABASE_URL="mysql://root:rootpassword@127.0.0.1:3307/manga_db"';

if (target === "xampp") {
  // สลับเป็น XAMPP 3306
  if (/^DATABASE_URL=.*$/m.test(envContent)) {
    envContent = envContent.replace(/^DATABASE_URL=.*$/m, XAMPP_URL);
  } else {
    envContent = `${XAMPP_URL}\n${envContent}`;
  }
  console.log("✅ สลับการเชื่อมต่อฐานข้อมูลเป็น [XAMPP] (Port 3306) สำเร็จ!");
} else {
  // สลับเป็น Docker MariaDB 3307
  if (/^DATABASE_URL=.*$/m.test(envContent)) {
    envContent = envContent.replace(/^DATABASE_URL=.*$/m, DOCKER_URL);
  } else {
    envContent = `${DOCKER_URL}\n${envContent}`;
  }
  console.log("✅ สลับการเชื่อมต่อฐานข้อมูลเป็น [Docker MariaDB] (Port 3307) สำเร็จ!");
}

fs.writeFileSync(envPath, envContent, "utf8");
