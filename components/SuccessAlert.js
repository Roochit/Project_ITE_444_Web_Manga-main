"use client";
 
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
 
export default function SuccessAlert() {
 
    const searchParams = useSearchParams();
    const router = useRouter();
 
    useEffect(() => {
 
        if (searchParams.get("success") === "create") {
 
            Swal.fire({
                title: "เพิ่มข้อมูลสำเร็จ",
                text: "บันทึกข้อมูลมังงะเรียบร้อยแล้ว",
                icon: "success",
                confirmButtonText: "ตกลง"
            });
 
            // ลบ ?success=create ออกจาก URL
            router.replace("/admin/mangas");
        }
 
        else if (searchParams.get("success") === "update") {
 
            Swal.fire({
                title: "ปรับปรุงข้อมูลสำเร็จ",
                text: "บันทึกข้อมูลมังงะเรียบร้อยแล้ว",
                icon: "success",
                confirmButtonText: "ตกลง"
            });
 
            // ลบ ?success=create ออกจาก URL
            router.replace("/admin/mangas");
        }
 
    }, [searchParams, router]);
 
    return null;
}