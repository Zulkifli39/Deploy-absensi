import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FiRefreshCcw } from "react-icons/fi";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";

import { API_PATHS } from "../../utils/ApiPaths";
import axiosInstance from "../../utils/AxiosInstance";
import { useUser } from "../../context/UserContext";
import { compressImageTo200KB } from "../../utils/ImageCompresor";

const CheckIn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { user } = useUser();

  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [photo, setPhoto] = useState(null);
  const [mode, setMode] = useState("REGISTER"); // REGISTER atau CHECKIN
  const [loading, setLoading] = useState(false);
  const [checkingFace, setCheckingFace] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState(null);

  // ==== Cek apakah user sudah punya wajah
  const checkUserFace = async () => {
    if (!user?.id) return;
    setCheckingFace(true);
    try {
      const res = await axiosInstance.get(API_PATHS.FACE.GET_FACE(user.id));
      setMode(res.data?.count > 0 ? "CHECKIN" : "REGISTER");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memeriksa data wajah");
    } finally {
      setCheckingFace(false);
    }
  };

  // ==== Start kamera
  const startCamera = async () => {
    try {
      stream?.getTracks().forEach((t) => t.stop());
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("CAMERA ERROR:", err);
      toast.error("Kamera tidak dapat diakses");
    }
  };

  useEffect(() => {
    checkUserFace();
    startCamera();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [user?.id, facingMode]);

  // ==== Ambil foto dari video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPhoto(dataUrl);
    return dataUrl;
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    return new File([Uint8Array.from(bstr, (c) => c.charCodeAt(0))], filename, { type: mime });
  };

  // ==== Registrasi wajah
  const registerFaceUser = async () => {
    if (!user?.id || !photo) return toast.error("User atau foto belum siap");
    setLoading(true);
    try {
      const rawFile = dataURLtoFile(photo, "face.jpg");
      const compressedBlob = await compressImageTo200KB(rawFile);
      const compressedFile = new File([compressedBlob], "face.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("user_id", String(user.id));
      formData.append("photo", compressedFile);

      const res = await axiosInstance.post(API_PATHS.FACE.CREATE_FACE, formData);
      toast.success(res.data.message || "Wajah berhasil didaftarkan");
      setPhoto(null);
      checkUserFace();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload gagal");
    } finally {
      setLoading(false);
    }
  };

  // ==== Ambil lokasi GPS real-time
  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("GPS tidak tersedia");
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGettingLocation(false);
          const coordinates = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCoords(coordinates);
          resolve(coordinates);
        },
        (err) => {
          setGettingLocation(false);
          reject(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

  // ==== Check-in
  const handleCheckIn = async () => {
    if (!user?.id) return toast.error("User belum siap");

    const locationId = user?.location_id || user?.location?.location_id;
    if (!locationId) return toast.error("Lokasi user belum tersedia");

    try {
      setLoading(true);
      toast.info("Mengambil lokasi GPS...");
      const currentCoords = await getCurrentLocation();

      if (!photo) throw new Error("Foto belum diambil. Klik tombol kamera terlebih dahulu.");

      const rawFile = dataURLtoFile(photo, "face.jpg");
      const compressedBlob = await compressImageTo200KB(rawFile);
      const compressedFile = new File([compressedBlob], "face.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("photo", compressedFile);
      formData.append("latitude", String(currentCoords.latitude));
      formData.append("longitude", String(currentCoords.longitude));
      formData.append("location_id", String(locationId));
      formData.append("face_verified", "true");

      const res = await axiosInstance.post(API_PATHS.FACE.CHECK_IN, formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(res.data.message || "Check-in berhasil ✅");
      setPhoto(null);
      setCoords(null);
    } catch (err) {
      console.error("Check-in error:", err);
      toast.error(err.response?.data?.message || err.message || "Check-in gagal ❌");
    } finally {
      setLoading(false);
    }
  };

  // ==== Tombol kamera
  const handleCameraClick = async () => {
    capturePhoto();
    if (mode === "REGISTER") {
      if (photo) await registerFaceUser();
    } else {
      if (photo) await handleCheckIn();
      else toast.info("Foto berhasil diambil! Klik lagi untuk check-in.");
    }
  };

  const isCameraButtonDisabled = () => loading || gettingLocation || checkingFace || (mode === "CHECKIN" && !user?.location_id && !user?.location?.location_id);

  return (
    <div className="p-4 mt-2 relative">
      {/* Loading overlay */}
      {(loading || gettingLocation || checkingFace) && (
        <div className="fixed inset-0 z-70 bg-black/60 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-semibold text-center">
            {checkingFace ? "Mengecek data wajah..." : gettingLocation ? "Mendeteksi lokasi..." : mode === "REGISTER" ? "Mendaftarkan wajah..." : "Check In..."}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-28 mb-4">
        <IoIosArrowBack className="text-2xl cursor-pointer" onClick={() => window.history.back()} />
        <span className="font-semibold text-lg">{mode === "REGISTER" ? "Daftar Wajah" : "Check In"}</span>
      </div>

      {/* Status */}
      <div className={`p-4 rounded-xl mb-4 ${mode === "REGISTER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
        {mode === "CHECKIN" && <h1 className="text-sm font-semibold">📍 Lokasi: {user?.location_name || user?.location?.location_name}</h1>}
        {mode === "REGISTER" && <h1 className="text-sm font-semibold">📸 Mode Registrasi Wajah</h1>}
        {coords && <p className="text-xs mt-1">GPS Device: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}</p>}
      </div>

      {/* Camera */}
      <div className="relative rounded-xl overflow-hidden bg-black mb-4">
        <video ref={videoRef} autoPlay playsInline className="w-full h-[500px] object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {/* Guide */}
        {!photo && !loading && !gettingLocation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-64 h-80 border-4 border-white/70 rounded-full shadow-lg"></div>
              <div className="absolute w-full top-[-80px] left-1/2 -translate-x-1/2 text-center">
                <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full shadow-lg">
                  Posisikan wajah di dalam oval
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-6 flex justify-between items-center">
          <button onClick={() => setFacingMode((p) => (p === "user" ? "environment" : "user"))} className="bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all" disabled={loading || gettingLocation || photo}>
            <FiRefreshCcw className="text-xl" />
          </button>

          <button onClick={handleCameraClick} disabled={isCameraButtonDisabled()} className={`text-3xl p-4 rounded-full border-4 border-white shadow-xl transition-all ${isCameraButtonDisabled() ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-white/80 hover:bg-white hover:scale-110 cursor-pointer'}`}>
            <FaCamera />
          </button>

          <div className="w-12" /> {/* Placeholder */}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
