import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const DAYS_IN_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const UserShiftScheduleTable = () => {
  const { user } = useUser();

  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [schedulePeriods, setSchedulePeriods] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [schedules, setSchedules] = useState({});
  const [lockedDays, setLockedDays] = useState({}); 

  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 500);
  
  const filteredData = useMemo(() => {
    if (!debouncedSearchText) return users;

    const lowerSearch = debouncedSearchText.toLowerCase();

    return users.filter((row) => {
      return (
        row.display_name.toLowerCase().includes(lowerSearch) ||
        (row.employee_id_number &&
          row.employee_id_number.toLowerCase().includes(lowerSearch)) ||
        (row.phone_number &&
          row.phone_number.toLowerCase().includes(lowerSearch))
      );
    });
  }, [users, debouncedSearchText]);

  
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL);
      let result = res.data.data || [];

        if (user.user_role_id === ROLES.KEPALA_INSTALASI) {
           result = result.filter((d) => d.department_id === user.department_id);
         } else if (user.user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
           result = result.filter((d) => d.sub_department_id === user.sub_department_id);
         }

      setUsers(result);
    } catch  {
      toast.error("Gagal mengambil data user");
    }
  };

  const fetchShifts = async () => {
    const res = await axiosInstance.get(API_PATHS.SHIFT.GET_ALL);
    setShifts(res.data.data || []);
  };

  const fetchPeriods = async () => {
    const res = await axiosInstance.get(
      API_PATHS.SCHEDULE_PERIODS.GET_ALL
    );
    setSchedulePeriods(res.data.data || []);
  };


  useEffect(() => {
    fetchUsers();
    fetchShifts();
    fetchPeriods();
  }, []);

  
  const fetchLockedDays = async (periodId) => {
    try {
      const res = await axiosInstance.get(
        API_PATHS.USER_SHIFT_SCHEDULES.GET_ALL.replace(
          ":period_id",
          periodId
        )
      );
      
      const map = {};

      res.data.data.forEach((item) => {
        const userId = item.user_id;
        const day = new Date(item.schedule_date).getDate();

        if (!map[userId]) map[userId] = {};
        map[userId][day] = {
          schedule_id: item.user_shift_schedule_id,
          shift_id: item.shift_id,
        };
      });
      
      setLockedDays(map);
    } catch {
      setLockedDays({});
    }
  };
  
  // const isDayLocked = (userId, day) =>
  //   !!lockedDays[userId]?.[day];

  const isDayLocked = () => {
  return selectedPeriod?.is_locked === true;
};

  const getScheduleId = (userId, day) =>
    lockedDays[userId]?.[day]?.schedule_id;

  const onSelectAll = (checked) => {
    setSelectedUsers(checked ? users.map((u) => u.user_id) : []);
  };

  const onSelectUser = (userId, checked) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };
  

  // Chande Shift
  const handleChange = (userId, day, value) => {
    if (isDayLocked(userId, day)) return;

    setSchedules((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [day]: value,
      },
    }));
  };
  
  const getUserShifts = (user) =>
    shifts.filter(
      (s) => s.department_id === user.department_id
    );

  // Submit
    const handleSubmit = async () => {
      if (!selectedPeriodId || selectedUsers.length === 0) {
      toast.error("Lengkapi periode dan user");
      return;
    }

    if (selectedPeriod?.is_locked) {
      toast.error("Periode sudah terkunci");
      return;
    }

    try {
      const [year, month] = selectedDate.split("-").map(Number);
      const endDay = new Date(
        selectedPeriod.end_date
      ).getDate();
      
      for (let userId of selectedUsers) {
        const userSchedules = schedules[userId] || {};
        
        for (let day in userSchedules) {
          if (Number(day) > endDay) continue;

          const value = userSchedules[day];
          if (!value) continue;

          const shiftId = Number(value.split(":")[1]);
          const dayStr = String(day).padStart(2, "0");
          const monthStr = String(month).padStart(2, "0");
          const scheduleDate = `${year}-${monthStr}-${dayStr}`;

          const scheduleId = getScheduleId(userId, Number(day));

          if (scheduleId) {
            // Update
            await axiosInstance.put(
              API_PATHS.USER_SHIFT_SCHEDULES.UPDATE
                .replace(":period_id", selectedPeriodId)
                .replace(":schedule_id", scheduleId),
              {
                shift_id: shiftId,
                schedule_date: scheduleDate,
              }
            );
          } else {
            // Create
            await axiosInstance.post(
              API_PATHS.USER_SHIFT_SCHEDULES.CREATE.replace(
                ":period_id",
                selectedPeriodId
              ),
              {
                user_id: Number(userId),
                shift_id: shiftId,
                schedule_date: scheduleDate,
              }
            );
          }
        }
      }

      toast.success("Jadwal shift berhasil disimpan");
      fetchLockedDays(selectedPeriodId);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal menyimpan data"
      );
    }
  };
  
 
  return (
    <div className="overflow-x-auto border rounded-xl shadow-sm p-3">
      <div className="flex flex-col md:flex-row mb-4 justify-between items-start md:items-center gap-3">
       {/* Kiri: Periode & Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Pilih Periode */}
          <select
            value={selectedPeriodId}
            onChange={(e) => {
              const periodId = e.target.value;
              setSelectedPeriodId(periodId);

              const found = schedulePeriods.find(
                (p) => String(p.period_id) === String(periodId)
              );

              if (found) {
                setSelectedPeriod(found);
                setSelectedDate(found.start_date.slice(0, 10));
                fetchLockedDays(periodId);
              } else {
                setSelectedPeriod(null);
                setSelectedDate("");
                setLockedDays({});
              }
            }}
            className="border p-2 rounded"
          >
            <option value="">Pilih Periode</option>
            {schedulePeriods.map((p) => (
              <option key={p.period_id} value={p.period_id}>
                {p.period_name}
              </option>
            ))}
          </select>

          {/* Tanggal Mulai */}
          <input
            type="date"
            value={selectedPeriod ? selectedPeriod.start_date.slice(0, 10) : ""}
            className="border p-2 rounded"
            readOnly
          />

          {/* Tanggal Selesai */}
          <input
            type="date"
            value={selectedPeriod ? selectedPeriod.end_date.slice(0, 10) : ""}
            className="border p-2 rounded"
            readOnly
          />

          {/* Search user */}
          <input
            type="text"
            placeholder="Cari user..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded w-full sm:w-64"
          />
        </div>

        {/* Kanan: Tombol Simpan */}
        <div className="mt-2 md:mt-0">
          <button
            onClick={handleSubmit}
            className="bg-turqoise text-white px-4 py-2 rounded w-full md:w-auto"
          >
            Simpan
          </button>
        </div>
     </div>

      <table className="min-w-max border-collapse text-xs">
        <thead className="sticky top-0 bg-gray-100 z-20">
          <tr>
            <th className="sticky left-0 bg-gray-100 border px-2 py-2">
              <input
                type="checkbox"
                onChange={(e) =>
                  onSelectAll(e.target.checked)
                }
              />
            </th>
            <th className="sticky left-[40px] bg-gray-100 border px-3 py-2 min-w-[180px]">
              Nama
            </th>
            <th className="border px-3 py-2">NIP</th>
            <th className="border px-3 py-2">
              Nomor Hp
            </th>
            {DAYS_IN_MONTH.map((day) => (
              <th
                key={day}
                className="border px-2 py-2 text-center"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
         {filteredData.map((user) => (
            <tr key={user.user_id}>
              <td className="sticky left-0 bg-white border text-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(
                    user.user_id
                  )}
                  onChange={(e) =>
                    onSelectUser(
                      user.user_id,
                      e.target.checked
                    )
                  }
                />
              </td>

              <td className="sticky left-[40px] bg-white border px-3 py-2">
                <div className="font-semibold">
                  {user.display_name}
                </div>
                <div className="text-[10px] text-gray-500">
                  {user.department_name}
                </div>
                <div className="text-[10px] text-gray-500">
                  {user.sub_department_name}
                </div>
              </td>

              <td className="border px-3 py-2">
                {user.employee_id_number}
              </td>
              <td className="border px-3 py-2">
                {user.phone_number}
              </td>

              {DAYS_IN_MONTH.map((day) => {
                const selected =
                  schedules[user.user_id]?.[day] ||
                  (lockedDays[user.user_id]?.[day]
                    ? `SHIFT:${lockedDays[user.user_id][day].shift_id}`
                    : "");

                const locked = isDayLocked(
                  user.user_id,
                  day
                );

                return (
                  <td
                    key={day}
                    className={`border p-[2px] ${
                      locked
                        ? "bg-gray-200 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <select
                      className="w-full rounded border px-1 py-[2px] text-[11px]"
                      value={selected}
                      disabled={locked}
                      onChange={(e) =>
                        handleChange(
                          user.user_id,
                          day,
                          e.target.value
                        )
                      }
                    >
                      <option value="">-</option>
                      {getUserShifts(user).map(
                        (shift) => (
                          <option
                            key={shift.shift_id}
                            value={`SHIFT:${shift.shift_id}`}
                          >
                            {shift.shift_name}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserShiftScheduleTable;
