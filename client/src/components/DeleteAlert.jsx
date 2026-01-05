import React from "react";

const DeleteAlert = ({ content, onDelete }) => {
  return (
    <div className="text-sm">
      <p>{content}</p>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onDelete}
          className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlert;
