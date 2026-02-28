import mammoth from "mammoth";
import PDFParser from "pdf2json";

export async function parseDocument(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";

  if (ext === "pdf") return parsePDF(buffer);
  if (ext === "docx" || ext === "doc") {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value || result.value.trim().length < 50) throw new Error("DOCX appears empty or too short");
    return result.value.trim();
  }

  throw new Error(`Unsupported file format: .${ext}`);
}

function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, true);

    parser.on("pdfParser_dataReady", () => {
      const text = parser.getRawTextContent().trim();
      if (text.length < 50) return reject(new Error("PDF appears empty or contains no extractable text"));
      resolve(text);
    });

    parser.on("pdfParser_dataError", (err: any) => {
      reject(new Error(`PDF parsing failed: ${err.parserError ?? "Unknown error"}`));
    });

    parser.parseBuffer(buffer);
  });
}
