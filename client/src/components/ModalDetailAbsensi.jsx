import React from "react";
import { formatDate, formatTime } from "../utils/Helper";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ModalDetailAbsensi = ({ type, data, onClose }) => {

 const BASE_IMAGE_URL = import.meta.env.VITE_API_URL ;

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return `${BASE_IMAGE_URL}${photoPath}`;
  };


  if (!data) return null;

  const modalTitle = {
    detail: "Detail Absensi",
    checkin: "Lokasi Absen Masuk",
    checkout: "Lokasi Absen Keluar",
    note: "Catatan",
  }[type];

// Ambil Kordinat
  const latitude =
    type === "checkin"
      ? Number(data.checkin_latitude)
      : Number(data.checkout_latitude);

  const longitude =
    type === "checkin"
      ? Number(data.checkin_longitude)
      : Number(data.checkout_longitude);

  const hasLocation =
    !isNaN(latitude) && !isNaN(longitude);

  const renderContent = () => {
    switch (type) {
      case "detail":
        return (
          <>
            <p>Tanggal: {formatDate(data.attendance_date)}</p>
            <p>Check In: {formatTime(data.checkin_time)}</p>
             {data?.checkin_photo_url && (
              <img
                src={getPhotoUrl(data.checkin_photo_url)}
                alt="Foto Check In"
                className="w-full h-[200px] object-cover rounded-lg border my-2"
                onError={(e) => (e.target.src = "/no-image.png")}
              />
            )}
            <p>Check Out: {formatTime(data.checkout_time)}</p>
              {data?.checkout_photo_url && (
              <img
                src={getPhotoUrl(data.checkout_photo_url)}
                alt="Foto Check Out"
                className="w-full h-[200px] object-cover rounded-lg border my-2"
                onError={(e) => (e.target.src = "/no-image.png")}
              />
            )}
          </>
        );

      case "checkin":
      case "checkout":
        return (
          <>
            <p>Latitude: {latitude}</p>
            <p>Longitude: {longitude}</p>

            {hasLocation ? (
              <div className="mt-3 h-[200px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={17}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={[latitude, longitude]}>
                    <Popup>
                      {type === "checkin"
                        ? "Lokasi Absen Masuk"
                        : "Lokasi Absen Keluar"}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <p className="text-red-500 mt-2">
                Lokasi tidak tersedia
              </p>
            )}
          </>
        );

      case "note":
        return <p>{data.note || "Tidak ada catatan"}</p>;

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[350px] rounded-xl shadow-lg overflow-hidden">
        <div className="bg-turqoise px-4 py-3">
          <h2 className="text-white font-semibold text-center text-[16px]">
            {modalTitle}
          </h2>
        </div>

        <div className="p-4 text-sm space-y-2 text-gray-700">
          {renderContent()}
        </div>

        <div className="p-2">
          <button
            onClick={onClose}
            className="w-full py-2 cursor-pointer bg-turqoise font-bold text-white rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailAbsensi;
