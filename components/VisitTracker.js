"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastLoggedRef = useRef({ path: "", time: 0 });

  useEffect(() => {
    if (!pathname) return;

    // คำนวณ Full path รวม search params
    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    const now = Date.now();
    // ป้องกันการยิง log ซ้ำซ้อนภายใน 2 วินาที สำหรับหน้าเดียวกัน
    if (
      lastLoggedRef.current.path === fullPath &&
      now - lastLoggedRef.current.time < 2000
    ) {
      return;
    }

    lastLoggedRef.current = { path: fullPath, time: now };

    // ส่งคำขอแบบไม่รบกวนการทำงานของ UI
    try {
      fetch("/api/log-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: fullPath,
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
        keepalive: true,
      }).catch((err) => {
        // เงียบข้อผิดพลาดไว้ในฝั่งไคลเอนต์เพื่อไม่ให้กระทบผู้ใช้
        console.debug("Visit logging skipped:", err);
      });
    } catch {
      // Ignored
    }
  }, [pathname, searchParams]);

  return null;
}
