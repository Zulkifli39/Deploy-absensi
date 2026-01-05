import React from "react";
import UploadShiftTable from "../../components/table/UploadShiftTable";

const UploadShiftSchedule = () => {
  return (
    <div className="px-4 py-3 w-full">
      <div className="bg-white p-5 shadow-md rounded-xl">
        <h2 className="text-xl font-semibold text-turqoise">
          Upload File Shift Pengguna
        </h2>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-xl p-4">
        <UploadShiftTable />
      </div>
    </div>
  );
};

export default UploadShiftSchedule;
