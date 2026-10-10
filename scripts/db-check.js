const mysql = require("mysql2/promise");

async function checkConnection(name, config) {
  try {
    const conn = await mysql.createConnection({
      ...config,
      connectTimeout: 2000,
    });
    const [rows] = await conn.query("SHOW TABLES;");
    const tables = rows.map((r) => Object.values(r)[0]);

    let userCount = 0;
    let adminCount = 0;
    let memberCount = 0;

    if (tables.includes("users")) {
      const [users] = await conn.query("SELECT role FROM users;");
      userCount = users.length;
      adminCount = users.filter((u) => u.role === "admin").length;
      memberCount = users.filter((u) => u.role !== "admin").length;
    }

    await conn.end();

    console.log(`✅ [${name}] เชื่อมต่อสำเร็จ!`);
    console.log(`   - Host/Port: ${config.host}:${config.port}`);
    console.log(`   - ฐานข้อมูล: ${config.database}`);
    console.log(`   - ตารางที่พบ (${tables.length}): ${tables.join(", ")}`);
    console.log(`   - ตาราง users: ${tables.includes("users") ? "พบ ✅" : "ไม่พบ ❌"}`);
    if (tables.includes("users")) {
      console.log(`     (ผู้ใช้ทั้งหมด: ${userCount} คน | Admin: ${adminCount} | Member: ${memberCount})`);
    }
    console.log("");
    return true;
  } catch (err) {
    console.log(`❌ [${name}] เชื่อมต่อไม่สำเร็จ (${err.message})`);
    console.log(`   - ตรวจสอบว่าบริการ ${name} กำลังเปิดทำงานอยู่หรือไม่\n`);
    return false;
  }
}

async function main() {
  console.log("==================================================");
  console.log("   ตรวจสอบการเชื่อมต่อฐานข้อมูล (XAMPP & Docker)   ");
  console.log("==================================================\n");

  // 1. ตรวจสอบ XAMPP (Port 3306)
  await checkConnection("XAMPP MySQL", {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "manga_db",
  });

  // 2. ตรวจสอบ Docker MariaDB บนเครื่อง Host (Port 3307)
  await checkConnection("Docker MariaDB (Host 3307)", {
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "rootpassword",
    database: "manga_db",
  });

  console.log("==================================================");
}

main();
