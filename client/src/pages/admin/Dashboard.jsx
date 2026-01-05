import React, { useContext, useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { CgProfile } from "react-icons/cg";
import { UserContext } from "../../context/UserContext";
import UseUserContext from "../../hooks/UseUserAuth";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

/* =====================
   HELPERS
===================== */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 12) return "Selamat Pagiii";
  if (hour >= 12 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  if (hour >= 18 && hour < 3) return "Selamat Malam";
  return "Selamat Malam";
};

const fetchCount = async (url) => {
  const res = await axiosInstance.get(url);
  return res.data?.data?.length || 0;
};

/* =====================
   DASHBOARD
===================== */
const Dashboard = () => {
  UseUserContext();
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [
          users,
          departments,
          subDepartments,
          roles,
          shifts,
          periods,
          attendance,
          employeeStatus,
        ] = await Promise.all([
          fetchCount(API_PATHS.USERS.GET_ALL),
          fetchCount(API_PATHS.DEPARTMENT.GET_ALL),
          fetchCount(API_PATHS.SUB_DEPARTMENTS.GET_ALL),
          fetchCount(API_PATHS.USER_ROLES.GET_ALL),
          fetchCount(API_PATHS.SHIFT.GET_ALL),
          fetchCount(API_PATHS.SCHEDULE_PERIODS.GET_ALL),
          fetchCount(API_PATHS.ATTENDANCE.GET_ALL),
          fetchCount(API_PATHS.EMPLOYEE_STATUS.GET_ALL),
        ]);

        setTotals({
          users,
          departments,
          subDepartments,
          roles,
          shifts,
          periods,
          attendance,
          employeeStatus,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* =====================
     CHART DATA
  ===================== */
  const masterChart = {
    labels: ["Users", "Dept", "Sub Dept", "Roles", "Shifts"],
    datasets: [
      {
        label: "Total",
        data: [
          totals.users,
          totals.departments,
          totals.subDepartments,
          totals.roles,
          totals.shifts,
        ],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const statusChart = {
    labels: ["Employee Status"],
    datasets: [
      {
        data: [totals.employeeStatus],
        backgroundColor: ["#FFD41D"],
      },
    ],
  };

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, 
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

  const stats = [
    { label: "Users", value: totals.users },
    { label: "Departments", value: totals.departments },
    { label: "Attendance", value: totals.attendance },
    { label: "Schedule Periods", value: totals.periods },
  ];

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-2xl font-semibold">
          {getGreeting()}, {user?.display_name}
        </h2>
        <p className="text-sm text-gray-500">
          {new Date().toDateString()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-turqoise p-4 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <CgProfile className="text-3xl text-black" />
              <span className="text-black">{s.label}</span>
            </div>
            <div className="mt-2 text-3xl font-bold">
              {loading ? "..." : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-3">
            Master Data Comparison
          </h3>
        <div className="h-[350px]"> 
    <Bar
      data={masterChart}
      options={chartOptions}
    />
  </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-3">
            Employee Status Overview
          </h3>
        <div className="h-[350px] flex items-center justify-center">
    <Doughnut
      data={statusChart}
      options={chartOptions}
    />
  </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
