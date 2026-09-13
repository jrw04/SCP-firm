import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from "docx";

export async function exportTextAsDocx(content: string, fileName: string) {
  const lines = content.split("\n");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "SCP CLOUD LAW FIRM", bold: true, color: "0F172A" })],
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "D4AF37", space: 8 },
            },
            spacing: { after: 300 },
          }),
          ...lines.map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line || " " })],
                spacing: { after: 120 },
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".docx") ? fileName : `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
