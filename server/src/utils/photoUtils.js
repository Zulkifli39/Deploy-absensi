import fs from "fs";
import path from "path";
import sharp from "sharp";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Makassar";

// // Fungsi untuk menambah teks dan kompres foto
// export const addTextToImage = async (imageBuffer, lat, lon, time) => {
//   try {
//     const text = `Lat: ${lat}, Lon: ${lon}, Time: ${time}`;
    
//     // Menggunakan sharp untuk menambahkan teks ke gambar dan kompresi
//     const outputPath = path.join(__dirname, "../uploads/checkin_checkout_images", `${Date.now()}.jpg`);
    
//     await sharp(imageBuffer)
//       .resize({ width: 800 })  // Menyesuaikan ukuran agar lebih kecil
//       .composite([{
//         input: Buffer.from(
//           `<svg width="800" height="100">
//             <text x="10" y="40" font-family="Arial" font-size="30" fill="white">${text}</text>
//           </svg>`
//         ),
//         top: 10,
//         left: 10
//       }])
//       .jpeg({ quality: 80 })  // Menyesuaikan kualitas untuk kompresi (bisa diatur sesuai kebutuhan)
//       .toFile(outputPath);  // Menyimpan file gambar ke disk
    
//     // Mengembalikan path gambar yang sudah disimpan
//     return outputPath;

//   } catch (error) {
//     console.error("Error while adding text and compressing the image:", error);
//     throw error;
//   }
// };

// // Fungsi untuk mengompresi gambar agar ukurannya di bawah 200KB
// export const compressImage = async (imageBuffer) => {
//   try {
//     const outputPath = path.join(__dirname, "../uploads/compressed", `${Date.now()}.jpg`);
    
//     await sharp(imageBuffer)
//       .resize({ width: 800 })
//       .jpeg({ quality: 70 })  // Menyesuaikan kualitas untuk memastikan ukuran di bawah 200KB
//       .toFile(outputPath);  // Menyimpan gambar yang sudah dikompresi

//     return outputPath;
//   } catch (error) {
//     console.error("Error while compressing the image:", error);
//     throw error;
//   }
// };

// export const addTextAndCompressImage = async (
//   buffer,
//   display_name,
//   latitude,
//   longitude,
//   timestamp,
//   type = "checkin" // ⬅️ default checkin
// ) => {
//   if (!Buffer.isBuffer(buffer)) {
//     throw new Error("Buffer foto tidak valid");
//   }

//   const uploadDir = path.join(process.cwd(), "uploads");
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const formattedTime = dayjs(timestamp)
//     .tz(TZ)
//     .format("DD-MM-YYYY HH:mm:ss");

//   // SVG watermark
//   const svg = `
//   <svg width="800" height="200">
//     <style>
//       .bg { fill: rgba(0,0,0,0.55); }
//       .text { fill: white; font-size: 28px; font-family: Arial, Helvetica, sans-serif; }
//     </style>

//     <rect x="0" y="0" width="800" height="200" class="bg" />

//     <text x="20" y="50" class="text">Nama: ${display_name || "-"}</text>
//     <text x="20" y="95" class="text">Waktu: ${formattedTime}</text>
//     <text x="20" y="140" class="text">Lokasi: ${latitude}, ${longitude}</text>
//   </svg>
//   `;

//   const filename = `checkin_${Date.now()}.jpg`;
//   const filepath = path.join(uploadDir, filename);

//   await sharp(buffer)
//     .resize(800)
//     .composite([
//       {
//         input: Buffer.from(svg),
//         gravity: "south" // watermark di bawah
//       }
//     ])
//     .jpeg({ quality: 75 })
//     .toFile(filepath);

//   return `/uploads/${filename}`;
// };


// export const addTextAndCompressImage = async (
//   buffer,
//   display_name,
//   latitude,
//   longitude,
//   timestamp,
//   type = "checkin"
// ) => {
//   if (!Buffer.isBuffer(buffer)) {
//     throw new Error("Buffer foto tidak valid");
//   }

//   const uploadDir = path.join(process.cwd(), "uploads");
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const formattedTime = dayjs(timestamp)
//     .tz(TZ)
//     .format("DD-MM-YYYY HH:mm:ss");

//   const svg = `
//   <svg width="800" height="200">
//     <style>
//       .bg { fill: rgba(0,0,0,0.55); }
//       .text { fill: white; font-size: 28px; font-family: Arial, Helvetica, sans-serif; }
//     </style>

//     <rect x="0" y="0" width="800" height="200" class="bg" />

//     <text x="20" y="50" class="text">Nama: ${display_name || "-"}</text>
//     <text x="20" y="95" class="text">Waktu: ${formattedTime}</text>
//     <text x="20" y="140" class="text">Lokasi: ${latitude}, ${longitude}</text>
//   </svg>
//   `;

//   const safeType = type === "checkout" ? "checkout" : "checkin";
//   const filename = `${safeType}_${Date.now()}.jpg`;
//   const filepath = path.join(uploadDir, filename);

//   await sharp(buffer)
//     .resize(800)
//     .composite([
//       {
//         input: Buffer.from(svg),
//         gravity: "south"
//       }
//     ])
//     .jpeg({ quality: 75 })
//     .toFile(filepath);

//   return `/uploads/${filename}`;
// };



const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * @param {Buffer} buffer
 * @param {String} displayName
 * @param {Number} latitude
 * @param {Number} longitude
 * @param {Date} timestamp
 * @param {String} type checkin | checkout
 */
export const addTextAndCompressImage = async (
  buffer,
  displayName,
  latitude,
  longitude,
  timestamp,
  type = "checkin"
) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Buffer foto tidak valid");
  }

  const folder = path.join("uploads", "img", type);
  ensureDir(folder);

  const filename = `${type}_${Date.now()}.jpg`;
  const filepath = path.join(folder, filename);

  const lines = [
    displayName || "Unknown User",
    new Date(timestamp).toLocaleString("id-ID"),
    `Lat: ${latitude}`,
    `Lng: ${longitude}`
  ];

  const svgText = lines
    .map(
      (line, i) =>
        `<text x="20" y="${40 + i * 28}" font-size="22" fill="white">${line}</text>`
    )
    .join("");

  const svg = `
<svg width="800" height="150">
  <rect x="0" y="0" width="800" height="150" fill="black" opacity="0.55"/>
  ${svgText}
</svg>
`;

  await sharp(buffer)
    .resize(800)
    .composite([{ input: Buffer.from(svg), gravity: "south" }])
    .jpeg({ quality: 70 })
    .toFile(filepath);

  return `/${filepath}`.replace(/\\/g, "/");
};

export const saveFaceImage = async (buffer, userId) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Buffer foto tidak valid");
  }

  const folder = path.join("uploads", "faces");
  ensureDir(folder);

  const filename = `face_${userId}_${Date.now()}.jpg`;
  const filepath = path.join(folder, filename);

  await sharp(buffer)
    .resize(600) // Ukuran standar untuk face recognition
    .jpeg({ quality: 90 }) // Kualitas tinggi untuk akurasi
    .toFile(filepath);

  return `/${filepath}`.replace(/\\/g, "/");
};

export const saveAvatar = async (buffer, userId) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Buffer foto tidak valid");
  }

  const folder = path.join("uploads", "avatars");
  ensureDir(folder);

  const filename = `avatar_${userId}_${Date.now()}.jpg`;
  const filepath = path.join(folder, filename);

  await sharp(buffer)
    .resize(500, 500, { fit: "cover" }) // Resize ke 500x500, crop jika perlu
    .jpeg({ quality: 80 })
    .toFile(filepath);

  return `/${filepath}`.replace(/\\/g, "/");
};
