import { Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import VisitTracker from "@/components/VisitTracker";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}



