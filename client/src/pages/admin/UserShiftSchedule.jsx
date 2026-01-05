import React from "react";
import UserShiftScheduleTable from "../../components/table/UserShiftScheduleTable";

const UserShiftSchedule = () => {

  return (
    <div className="px-4 py-3 w-full">
      {/* HEADER */}
      <div className="bg-white p-5 shadow-md rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-turqoise">
            Tambah Jadwal Shift 
          </h2>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-xl">
        <UserShiftScheduleTable
        />
      </div>
    </div>
  );
};

export default UserShiftSchedule;
