import React, { useState, useEffect, useContext } from "react";
import { IoNotifications } from "react-icons/io5";
import { HiClock } from "react-icons/hi";
import { Link } from "react-router-dom";
import { formatTime } from "../../utils/Helper";

import Fitur from "./Fitur";
import AbsensiNew from "./AbsensiNew";

import { UserContext } from "../../context/UserContext";
import { API_PATHS } from "../../utils/ApiPaths";
import axiosInstance from "../../utils/AxiosInstance";

const Home = () => {
  const { user } = useContext(UserContext);

  const [dateTime, setDateTime] = useState(new Date());
  const [schedulePeriods, setSchedulePeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [userShiftSchedule, setUserShiftSchedule] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState(null);

  const hasCheckedIn = Boolean(attendance?.checkin_time);
  const hasCheckedOut = Boolean(attendance?.checkout_time);

  // Reset saat use ganti
  useEffect(() => {
    if (!user?.id) return;

    setAttendance(null);
    setUserShiftSchedule([]);
  }, [user?.id]);

  const fetchSchedulePeriods = async () => {
    const res = await axiosInstance.get(API_PATHS.SCHEDULE_PERIODS.GET_ALL);
    const periods = res.data?.data || [];
    setSchedulePeriods(periods);

    const today = new Date();
    const active =
      periods.find((p) => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        return today >= start && today <= end;
      }) || periods[0];

    setSelectedPeriodId(active?.period_id || null);
  };

  const fetchShifts = async () => {
    const res = await axiosInstance.get(API_PATHS.SHIFT.GET_ALL);
    setShifts(res.data?.data || []);
  };

  const fetchUserShiftSchedule = async (periodId) => {
    if (!periodId) return;
    const res = await axiosInstance.get(
      API_PATHS.USER_SHIFT_SCHEDULES.GET_ALL.replace(":period_id", periodId)
    );
    setUserShiftSchedule(res.data?.data || []);
  };

  const fetchAttendanceToday = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ATTENDANCE.GET_HISTORY);
      const list = res.data?.data || [];

      const today = new Date().toISOString().split("T")[0];

      const todayAttendance = list.find(
        (a) =>
          a.user_id === user.id &&
          a.attendance_date?.split(" ")[0] === today
      );

      setAttendance(todayAttendance || null);
    } catch (err) {
      console.error("Fetch attendance error:", err);
      setAttendance(null);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchSchedulePeriods();
    fetchShifts();
    fetchAttendanceToday();

    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (selectedPeriodId) fetchUserShiftSchedule(selectedPeriodId);
  }, [selectedPeriodId]);

  // Format tanggal
  const formattedDate = dateTime.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const today = new Date().toISOString().split("T")[0];

  const todaysSchedule = userShiftSchedule.filter(
    (s) =>
      s.user_id === user.id &&
      s.schedule_date?.split("T")[0] === today
  );

  return (
    <div className="flex flex-col bg-secondary">
      <div className="flex-1 overflow-y-auto px-4 pt-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex">
            <img
              src="/src/assets/kemenkes.svg"
              alt="Kemenkes RS Makassar"
              width={50}
            />
            <div className="flex flex-col ml-4">
              <h3 className="text-[16px] font-normal">Selamat Datang</h3>
              <h4 className="font-semibold text-[16px]">
                {user?.display_name} 👋
              </h4>
            </div>
          </div>
          <IoNotifications size={40} className="bg-gray-300 p-2 rounded-full" />
        </div>

        <div className="bg-turqoise mt-6 rounded-xl shadow-lg">
          <div className="p-4">
            <h2 className="text-white text-sm">Jadwal Hari Ini</h2>
            <p className="text-white font-bold mt-1">{formattedDate}</p>

            {todaysSchedule.length > 0 ? (
              todaysSchedule.map((s) => {
                const shift = shifts.find(
                  (sh) => sh.shift_id === s.shift_id
                );

                return (
                  <div
                    key={s.user_shift_schedule_id}
                    className="flex items-center mt-2 bg-white/25 rounded-lg px-2 py-1"
                  >
                    <HiClock className="text-white mr-2" />
                    <p className="text-white font-bold text-sm">
                      {shift
                        ? `${shift.checkin_time} - ${shift.checkout_time}`
                        : "Shift"}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center mt-2 bg-white/25 rounded-lg px-2 py-1">
                <HiClock className="text-white mr-2" />
                <p className="text-white font-bold text-sm">
                  Tidak ada jadwal hari ini
                </p>
              </div>
            )}

            {/* Button Checkin/Checkout */}
              <div className="flex gap-3 mt-4 ">
              <Link
                to={hasCheckedIn ? "#" : "/checkin"}
                onClick={(e) => hasCheckedIn && e.preventDefault()}
                className={`flex-1 font-semibold p-2 rounded-lg text-center
                  ${
                    hasCheckedIn
                      ? "bg-white text-[14px] text-turqoise cursor-not-allowed"
                      : "bg-white text-turqoise"
                  }`}
              >
                <div className="flex gap-5 justify-center text-center ">
                <img src="/src/assets/fitur/checkin.svg" alt="" className="" />
                {hasCheckedIn
                  ? `(${formatTime(attendance.checkin_time)})`
                  : "Check In"}
                </div>
              </Link>

              <Link
                to={!hasCheckedIn || hasCheckedOut ? "#" : "/checkout"}
                onClick={(e) =>
                  (!hasCheckedIn || hasCheckedOut) &&
                  e.preventDefault()
                }
                className={`flex-1 font-semibold p-2 rounded-lg text-center
                  ${
                    !hasCheckedIn || hasCheckedOut
                      ? "bg-white text-[14px] text-turqoise cursor-not-allowed"
                      : "bg-white text-turqoise"
                  }`}
              >
                <div className="flex gap-5 justify-center items-center">
                  <img src="/src/assets/fitur/checkout.svg" alt="" />
                {hasCheckedOut
                  ? `(${formatTime(attendance.checkout_time)})`
                  : "Check Out"}
                </div>
              </Link>
            </div>
          </div>
        </div>

        <Fitur />
        <AbsensiNew />
      </div>
    </div>
  );
};

export default Home;
