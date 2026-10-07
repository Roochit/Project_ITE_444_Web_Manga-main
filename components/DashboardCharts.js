"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardCharts({ statusData, chapterData }) {
  // กราฟวงกลม: สถานะมังงะ (Ongoing vs Completed)
  const doughnutData = {
    labels: ["กำลังดำเนินเรื่อง (Ongoing)", "จบแล้ว (Completed)"],
    datasets: [
      {
        data: [statusData.ongoing, statusData.completed],
        backgroundColor: ["#f59e0b", "#10b981"],
        hoverBackgroundColor: ["#d97706", "#059669"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 16,
          font: {
            size: 13,
            family: "'Prompt', sans-serif, system-ui",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = (statusData.ongoing + statusData.completed) || 1;
            const percentage = Math.round((value / total) * 100);
            return ` ${label}: ${value} เรื่อง (${percentage}%)`;
          },
        },
      },
    },
    cutout: "68%",
  };

  // กราฟแท่ง: จำนวนตอนของแต่ละมังงะ
  const barData = {
    labels: chapterData.map((item) =>
      item.title.length > 15 ? item.title.substring(0, 15) + "..." : item.title
    ),
    datasets: [
      {
        label: "จำนวนตอน (ตอน)",
        data: chapterData.map((item) => item.chaptersCount),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        hoverBackgroundColor: "rgba(37, 99, 235, 1)",
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const index = context[0].dataIndex;
            return chapterData[index]?.title || "";
          },
          label: function (context) {
            return ` จำนวน: ${context.parsed.y} ตอน`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="row g-4 mb-4">
      {/* กราฟแท่ง: มังงะที่มีตอนมากที่สุด */}
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
          <div className="card-body d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="card-title fw-bold mb-1">
                  <i className="bi bi-bar-chart-line text-primary me-2"></i>
                  จำนวนตอนในแต่ละเรื่อง
                </h5>
                <small className="text-muted">เปรียบเทียบจำนวนตอนของมังงะ</small>
              </div>
            </div>
            <div style={{ height: "280px" }}>
              {chapterData.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  ยังไม่มีข้อมูลมังงะ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* กราฟวงกลม: สัดส่วนสถานะมังงะ */}
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
          <div className="card-body d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="card-title fw-bold mb-1">
                  <i className="bi bi-pie-chart text-warning me-2"></i>
                  สัดส่วนสถานะมังงะ
                </h5>
                <small className="text-muted">กำลังดำเนินเรื่อง vs จบแล้ว</small>
              </div>
            </div>
            <div style={{ height: "280px" }} className="position-relative">
              {statusData.ongoing + statusData.completed > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  ยังไม่มีข้อมูลมังงะ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
