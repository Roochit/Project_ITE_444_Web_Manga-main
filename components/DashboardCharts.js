"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function DashboardCharts({ statusData, chapterData, trafficData }) {

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

  // กราฟเส้น/พื้นที่: สถิติผู้เข้าชมเว็บไซต์ (Traffic Trends)
  const trafficChartData = trafficData
    ? {
        labels: trafficData.labels || [],
        datasets: [
          {
            label: "ยอดเปิดดูหน้าเว็บ (Pageviews)",
            data: trafficData.visits || [],
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            tension: 0.35,
            fill: true,
            pointBackgroundColor: "#6366f1",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: "ผู้เข้าชมที่ไม่ซ้ำ (Unique IP)",
            data: trafficData.uniqueVisitors || [],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.35,
            fill: true,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
          },
        ],
      }
    : null;

  const trafficChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 12 },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
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
    <>
      {/* กราฟสถิติผู้เข้าชมเว็บไซต์ (Traffic Chart) */}
      {trafficData && (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
              <div>
                <h5 className="card-title fw-bold mb-1 d-flex align-items-center gap-2">
                  <i className="bi bi-graph-up text-indigo text-primary"></i>
                  <span>แนวโน้มสถิติผู้เข้าชมเว็บไซต์ย้อนหลัง 7 วัน (Traffic Trends)</span>
                </h5>
                <small className="text-muted">
                  เปรียบเทียบจำนวนการเปิดดูหน้าเว็บ (Pageviews) และผู้เยี่ยมชมแบบ Unique IP
                </small>
              </div>
              <span className="badge bg-light text-primary border px-3 py-2">
                <i className="bi bi-shield-check me-1"></i>
                บันทึก Log อัตโนมัติแบบเรียลไทม์
              </span>
            </div>
            <div style={{ height: "260px" }}>
              {trafficData.labels && trafficData.labels.length > 0 ? (
                <Line data={trafficChartData} options={trafficChartOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  ยังไม่มีข้อมูลผู้เข้าชมเว็บไซต์
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

