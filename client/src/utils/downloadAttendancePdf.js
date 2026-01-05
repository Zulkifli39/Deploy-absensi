import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatTime } from "./Helper";

const downloadAttendancePDF = ({
  data = [],
  startDate = "-",
  endDate = "-",
  filename = "laporan-absensi.pdf",
}) => {
  if (!data.length) {
    alert("Data absensi kosong");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");

  doc.setFontSize(14);
  doc.text("LAPORAN ABSENSI", 105, 15, { align: "center" });

  doc.setFontSize(10);
  doc.text(
    `Periode: ${startDate} s/d ${endDate}`,
    105,
    22,
    { align: "center" }
  );

  const tableColumn = [
    "No",
    "Tanggal",
    "Check In",
    "Check Out",
    "Status",
  ];

  const tableRows = data.map((item, index) => [
    index + 1,
    formatDate(item.attendance_date),
    formatTime(item.checkin_time),
    formatTime(item.checkout_time),
    item.is_late
      ? "Terlambat"
      : item.is_early_leave
      ? "Pulang Cepat"
      : "Tepat Waktu",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [0, 124, 133],
    },
  });

  doc.setFontSize(8);
  doc.text(
    `Dicetak pada ${new Date().toLocaleString("id-ID")}`,
    14,
    doc.internal.pageSize.height - 10
  );

  doc.save(filename);
};

export default downloadAttendancePDF;
