import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "./types";

function stripHtml(html: string) {
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

export const generateDocx = async (data: ResumeData) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: stripHtml(data.contact.fullName || ""),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin]
              .filter(Boolean)
              .map(stripHtml)
              .join(" | "),
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Summary
          ...(data.summary
            ? [
                new Paragraph({
                  text: "Summary",
                  heading: HeadingLevel.HEADING_2,
                  border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                  spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                  text: stripHtml(data.summary),
                  spacing: { after: 200 },
                }),
              ]
            : []),

          // Experience
          ...(data.experience && data.experience.length > 0
            ? [
                new Paragraph({
                  text: "Esperienza",
                  heading: HeadingLevel.HEADING_2,
                  border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                  spacing: { before: 200, after: 100 },
                }),
                ...data.experience.flatMap((exp) => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: stripHtml(exp.role || ""), bold: true }),
                      new TextRun({ text: ` presso ${stripHtml(exp.company || "")}` }),
                    ],
                    spacing: { before: 100 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `${stripHtml(exp.startDate || "")} - ${stripHtml(exp.endDate || "")}`, italics: true })],
                    spacing: { after: 50 },
                  }),
                  new Paragraph({
                     text: stripHtml(exp.description || ""),
                     spacing: { after: 200 },
                  }),
                ]),
              ]
            : []),

          // Education
          ...(data.education && data.education.length > 0
            ? [
                new Paragraph({
                  text: "Formazione",
                  heading: HeadingLevel.HEADING_2,
                  border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                  spacing: { before: 200, after: 100 },
                }),
                ...data.education.flatMap((edu) => [
                  new Paragraph({
                    children: [new TextRun({ text: stripHtml(edu.degree || ""), bold: true })],
                    spacing: { before: 100 },
                  }),
                  new Paragraph({
                    children: [
                       new TextRun({ text: stripHtml(edu.institution || "") }),
                       new TextRun({ text: ` | ${stripHtml(edu.graduationDate || "")}`, italics: true })
                    ],
                    spacing: { after: 200 },
                  }),
                ]),
              ]
            : []),

          // Skills
          ...(data.skills && data.skills.length > 0
            ? [
                new Paragraph({
                  text: "Competenze",
                  heading: HeadingLevel.HEADING_2,
                  border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                  spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                  text: data.skills.map(stripHtml).join(", "),
                  spacing: { after: 200 },
                }),
              ]
            : []),
            
          // Languages
          ...(data.languages && data.languages.length > 0
            ? [
                new Paragraph({
                  text: "Lingue",
                  heading: HeadingLevel.HEADING_2,
                  border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                  spacing: { before: 200, after: 100 },
                }),
                ...data.languages.map((lang) => 
                   new Paragraph({
                      text: `${stripHtml(lang.name || "")} - ${stripHtml(lang.level || "")}`
                   })
                )
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `CV_${stripHtml(data.contact.fullName || "Mio").replace(/\s+/g, '_')}.docx`);
};
