import React from "react";

const BaseModal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white  max-w-3xl rounded-xl shadow-lg">

        <div className="flex justify-between text-white bg-turqoise items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="px-6  py-4 border-t flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
