import { jsPDF } from "jspdf";

export function exportTextAsPdf(title: string, content: string, fileName: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 56;
  let y = 72;

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("SCP CLOUD LAW FIRM", marginX, y);
  y += 22;

  doc.setDrawColor(212, 175, 55); // gold-500
  doc.setLineWidth(1);
  doc.line(marginX, y, 595 - marginX, y);
  y += 28;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, 595 - marginX * 2);
  for (const line of lines) {
    if (y > 780) {
      doc.addPage();
      y = 72;
    }
    doc.text(line, marginX, y);
    y += 16;
  }

  doc.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
