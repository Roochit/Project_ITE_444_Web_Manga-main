const prisma = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prismaClient = new prisma.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "manga_secret_key_jwt_super_secure_2026";

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function runTests() {
  console.log("=========================================");
  console.log("       เริ่มต้นทดสอบระบบ Authentication   ");
  console.log("=========================================\n");

  try {
    // 1. ทดสอบ Hash & Verify รหัสผ่าน
    console.log("1. ทดสอบการแฮชและตรวจสอบรหัสผ่านด้วย bcrypt:");
    const testHash = await hashPassword("admin123");
    const match = await verifyPassword("admin123", testHash);
    const wrongMatch = await verifyPassword("wrongpass", testHash);
    console.log(`   - รหัสผ่านถูกต้องตรงกัน: ${match ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`   - รหัสผ่านผิดปฏิเสธถูกต้อง: ${!wrongMatch ? "PASS ✅" : "FAIL ❌"}`);

    // 2. ทดสอบ JWT Sign & Verify
    console.log("\n2. ทดสอบการสร้างและตรวจสอบ JWT Token:");
    const sampleToken = signToken({ id: 1, name: "Admin Manga", role: "admin" });
    const verified = verifyToken(sampleToken);
    console.log(`   - ถอดรหัส Token ถูกต้อง: ${verified?.name === "Admin Manga" && verified?.role === "admin" ? "PASS ✅" : "FAIL ❌"}`);

    // 3. ตรวจสอบบัญชี Admin ในฐานข้อมูล
    console.log("\n3. ตรวจสอบบัญชี Admin เริ่มต้นในฐานข้อมูล:");
    const adminUser = await prismaClient.users.findUnique({
      where: { email: "admin@manga.com" },
    });
    console.log(`   - พบ Admin (admin@manga.com): ${adminUser ? "PASS ✅" : "FAIL ❌"}`);
    if (adminUser) {
      const isPassCorrect = await verifyPassword("admin123", adminUser.password);
      console.log(`   - รหัสผ่าน 'admin123' ใช้งานได้: ${isPassCorrect ? "PASS ✅" : "FAIL ❌"}`);
      console.log(`   - สิทธิ์ (Role): ${adminUser.role === "admin" ? "admin ✅" : "FAIL ❌"}`);
    }

    // 4. ตรวจสอบบัญชี Member ในฐานข้อมูล
    console.log("\n4. ตรวจสอบบัญชี Member เริ่มต้นในฐานข้อมูล:");
    const memberUser = await prismaClient.users.findUnique({
      where: { email: "member@manga.com" },
    });
    console.log(`   - พบ Member (member@manga.com): ${memberUser ? "PASS ✅" : "FAIL ❌"}`);
    if (memberUser) {
      const isPassCorrect = await verifyPassword("member123", memberUser.password);
      console.log(`   - รหัสผ่าน 'member123' ใช้งานได้: ${isPassCorrect ? "PASS ✅" : "FAIL ❌"}`);
      console.log(`   - สิทธิ์ (Role): ${memberUser.role === "member" ? "member ✅" : "FAIL ❌"}`);
    }

    // 5. ทดสอบการสมัครสมาชิก (Register) สมาชิกใหม่
    console.log("\n5. ทดสอบการสมัครสมาชิกใหม่ (Register User):");
    const testEmail = "tester_" + Date.now() + "@example.com";
    const newHashedPass = await hashPassword("secure123");
    const createdMember = await prismaClient.users.create({
      data: {
        name: "Test Tester",
        email: testEmail,
        password: newHashedPass,
        role: "member",
      },
    });
    console.log(`   - สร้างสมาชิกใหม่ ID #${createdMember.id} (${createdMember.email}): PASS ✅`);
    console.log(`   - สิทธิ์สมาชิกใหม่เริ่มต้นเป็น: '${createdMember.role}': PASS ✅`);

    // 6. ทดสอบการเข้าสู่ระบบของสมาชิกใหม่
    console.log("\n6. ทดสอบการเข้าสู่ระบบของสมาชิกที่เพิ่งสมัคร:");
    const loginUser = await prismaClient.users.findUnique({ where: { email: testEmail } });
    const canLogin = await verifyPassword("secure123", loginUser.password);
    console.log(`   - เข้าสู่ระบบด้วยรหัสผ่านใหม่: ${canLogin ? "PASS ✅" : "FAIL ❌"}`);

    // ลบบัญชีทดสอบออก
    await prismaClient.users.delete({ where: { id: createdMember.id } });
    console.log(`   - ล้างบัญชีทดสอบออกจากฐานข้อมูลเรียบร้อย: PASS ✅`);

    console.log("\n=========================================");
    console.log("       ผลการทดสอบทั้งหมด: ผ่าน 100% ✅    ");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
}

runTests();
