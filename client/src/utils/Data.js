import { LuLayoutDashboard, LuLogOut } from "react-icons/lu";
import { BsClipboardData, BsQrCodeScan } from "react-icons/bs";
import { FaFileContract, FaRegFileAlt } from "react-icons/fa";
import { IoSettingsSharp, IoLogOutOutline } from "react-icons/io5";
import { FaUser, FaClock, FaCamera } from "react-icons/fa";
import { IoMdHome } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { IoMdInformationCircle } from "react-icons/io";
import { TbReportSearch } from "react-icons/tb";
import { FaFilePdf } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { GrUserAdmin } from "react-icons/gr";
import { DiOpenshift } from "react-icons/di";
import { MdAddLocationAlt } from "react-icons/md";
import { VscFileSubmodule } from "react-icons/vsc";
import { MdScheduleSend } from "react-icons/md";
import { FaUsersGear } from "react-icons/fa6";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { BiQrScan } from "react-icons/bi";
import { MdOutlineManageSearch } from "react-icons/md";
import { FcOvertime } from "react-icons/fc";
// Menu Dashboard
export const SIDE_MENU_DASHBOARD = [
  {
    id: "01",
    label: "Dashboard",
    icon: MdDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Data Master",
    icon: BiQrScan,
    subMenu : [
      {
        id : "02-01",
        label : "Departement",
        path : "/dashboard/department",
        icon : FaRegFileAlt,
      },
      {
        id : "02-02",
        label : "Sub Departement",
        path : "/dashboard/sub-department",
        icon  :VscFileSubmodule,
      },
      {
        id : "02-03",
        label : "Lokasi",
        path : "/dashboard/manage-location",
        icon : MdAddLocationAlt,
      },
      {
        id : "02-04",
        label : "Peran Pengguna",
        path : "/dashboard/role-management",
        icon : GrUserAdmin,
      },
      {
        id : "02-05",
        label : "Status Karyawan",
        path : "/dashboard/status",
        icon : HiOutlineStatusOnline,
      },
      {
        id : "02-06",
        label : "Pengguna",
        path : "/dashboard/manage-users",
        icon : FaUsers,
      },
      {
        id : "02-07",
        label : "Informasi Absensi",
        path : "/dashboard/manage-informasi",
        icon : FaFilePdf,
      },
      {
        id : "02-08",
        label : "Manajemen Shift",
        path : "/dashboard/shift-management",
        icon : MdOutlineManageSearch,
      }
    ]
  },
  {
    id: "03",
    label : "Data Management",
    icon :  DiOpenshift,
    subMenu : [
      {
        id : "03-01",
        label : "Jadwal Periode",
        path : "/dashboard/schedule-periods",
        icon : MdScheduleSend,
      },
       {
        id : "03-02",
        label : "Overtime & Lembur",
        path : "/dashboard/overtime-lembur",
        icon : FcOvertime,
      },
      {
        id : "03-03",
        label : "Tambah Jadwal Shift Pengguna",
        path : "/dashboard/user-shift-schedules",
        icon : FaUsersGear,
      },
       {
        id : "03-04",
        label : "Upload File Shift Pengguna",
        path : "/dashboard/upload-shift-schedules",
        icon : IoCloudUploadOutline,
      },
       {
        id : "03-05",
        label : "Laporan Absensi",
        path : "/dashboard/laporan-absensi",
        icon : FaFileContract,
      },
    ]
  }
];

export const SIDE_MENU = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Department",
    icon: BsQrCodeScan,
    path: "/dashboard/department",
  },
  {
    id: "03",
    label: "Artikel",
    icon: FaRegFileAlt,
    path: "/dashboard/artikel",
  },
  {
    id: "04",
    label: "Master Data",
    icon: BsClipboardData,
    path: "/dashboard/master-data",
  },
    {
    id: "05",
    label: "Laporan",
    icon: TbReportSearch,
    path: "/dashboard/laporan",
  },
]

// Menu Footer
export const MENU_FOOTER = [
  {
    id: "01",
    label: "Home",
    icon: IoMdHome,
    path: "/home",
  },
  {
    id: "02",
    label: "Laporan",
    icon: FaRegFileAlt,
    path: "/laporan-absensi",
  },
  {
    id: "03",
    label: "",
    icon: FaCamera,
    path: "/checkin",
  },
  {
    id: "04",
    label: "Jam Kerja",
    icon: FaClock,
    path: "/jam-kerja",
  },
  {
    id: "05",
    label: "Profile",
    icon: FaUser,
    path: "/profile",
  },
];

// Menu Fitur
export const MENU_FITUR = [
  {
    id: "01",
    label: "Laporan",
    icon: "/src/assets/fitur/laporan.svg",
    path: "/laporan-absensi",
  },
  {
    id: "02",
    label: "Profil",
    icon: "/src/assets/fitur/profile.svg",
    path: "/profile",
  },
  {
    id: "03",
    label: "Tentang", 
    icon: "/src/assets/fitur/tentang.svg",
    path: "/informasi",
  },
  {
    id: "04",
    label: "Ubah Sandi",
    icon: "/src/assets/fitur/reset.svg",
    path: "/keamanan",
  },
  {
    id: "05",
    label: "Jam Kerja",
    icon: "/src/assets/fitur/jamkerja.svg",
    path: "/jam-kerja",
  },
   {
    id: "06",
    label: "Info OSDM",
    icon: "/src/assets/fitur/osdm.svg",
    path: "/info-osdm",
  },
   {
    id: "07",
    label: "Overtime",
    icon: "/src/assets/fitur/osdm.svg" ,
    path: "/overtime-lembur",
  },
   {
    id: "08", 
    label: "Soon",
    icon: "/src/assets/fitur/soon.svg",
    path: "/update",
  },
];

// Menu Pengaturan
export const MENU_PENGATURAN = [
  {
    id: "01",
    label: "Profile",
    desc: "Atur informasi pribadi",
    icon: CgProfile,
    path: "/detail-profil",
    iconColor : "text-[#007C85]",
    bgColor : "bg-[#DCFCE7]"
  },
  {
    id: "02",
    label: "Keamanan",
    desc: "Ubah Email & Password",
    icon: FaUnlockKeyhole,
    path: "/keamanan",
    iconColor : "text-[#CD8626]",
    bgColor : "bg-[#FEF9C3]"
  },
  {
    id: "03",
    label: "Info Aplikasi",
    desc: "Informasi tentang aplikasi",
    icon: IoMdInformationCircle,
    path: "/informasi",
    iconColor : "text-[#1E40AF]",
    bgColor : "bg-[#DBEAFE]"
  },
  {
    id: "04",
    label: "Logout",
    desc: "Keluar dari aplikasi",
    icon: IoLogOutOutline,
    path: "/logout",
    iconColor : "text-[#BC0000]",
    bgColor : "bg-[#FAE6E6]"
  },
];



