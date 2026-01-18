import mammoth from "mammoth";

type PDFParseResult = {
  text: string;
  [key: string]: unknown;
};

type PDFParseFn = (
  data: Buffer | Uint8Array,
  options?: Record<string, unknown>,
) => Promise<PDFParseResult>;

export async function parseDocument(
  buffer: Buffer | null,
  filename: string,
): Promise<string> {
  const extension = (filename || "").toLowerCase().split(".").pop() ?? "";

  if (!buffer) {
    console.error("parseDocument called with null or undefined buffer");
    throw new Error("No file buffer provided to parseDocument");
  }

  try {
    if (extension === "pdf") {
      const mod = await import("pdf-parse");
      const pdfParse: PDFParseFn =
        (mod as unknown as { default?: PDFParseFn }).default ??
        (mod as unknown as PDFParseFn);

      try {
        console.log(
          `parseDocument: parsing PDF ${filename} (bytes=${(buffer as Buffer).byteLength ?? (buffer as Buffer).length})`,
        );
        const parsed = await pdfParse(buffer as Buffer);
        if (!parsed || typeof parsed.text !== "string") {
          console.error(
            "parseDocument: pdf-parse returned unexpected result",
            parsed,
          );
          throw new Error("pdf-parse returned unexpected result");
        }
        return parsed.text;
      } catch (pdfErr) {
        console.error(
          "parseDocument: pdf-parse error for file",
          filename,
          pdfErr,
        );
        throw new Error(
          `Failed to parse PDF file: ${pdfErr instanceof Error ? pdfErr.message : String(pdfErr)}`,
        );
      }
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result?.value ?? "";
    } else {
      throw new Error(
        "Unsupported file format. Supported formats: PDF (.pdf) and DOCX (.docx).",
      );
    }
  } catch (err) {
    console.error("Document parsing error:", err);
    throw new Error(
      `Failed to parse ${extension ? extension.toUpperCase() : "file"} file`,
    );
  }
}
