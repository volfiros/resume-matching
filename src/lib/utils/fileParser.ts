import mammoth from "mammoth";
import PDFParser from "pdf2json";

export async function parseDocument(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Invalid or empty file buffer");
  }

  const extension = filename.toLowerCase().split(".").pop() ?? "";
  console.log(
    `Parsing ${extension} file: ${filename} (${buffer.length} bytes)`,
  );

  try {
    if (extension === "pdf") {
      return await parsePDF(buffer, filename);
    } else if (extension === "docx" || extension === "doc") {
      return await parseDOCX(buffer, filename);
    } else {
      throw new Error(
        `Unsupported file format: ${extension}. Supported formats: PDF (.pdf) and DOCX (.docx)`,
      );
    }
  } catch (error) {
    console.error(`Error parsing ${extension} file:`, error);
    throw error;
  }
}

async function parsePDF(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Attempting to parse PDF: ${filename}`);

      const pdfParser = new PDFParser(null, true);

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          const text = pdfParser.getRawTextContent();

          console.log(
            `PDF parsed successfully: ${text.length} characters extracted`,
          );

          if (text.length === 0) {
            reject(
              new Error(
                "PDF appears to be empty or contains no extractable text",
              ),
            );
            return;
          }

          if (text.length < 50) {
            console.warn(
              `Warning: PDF text seems unusually short (${text.length} chars)`,
            );
          }

          resolve(text.trim());
        } catch (err) {
          reject(
            new Error(
              `Failed to extract text from PDF: ${err instanceof Error ? err.message : "Unknown error"}`,
            ),
          );
        }
      });

      pdfParser.on("pdfParser_dataError", (error: any) => {
        console.error("PDF parsing error:", error);
        reject(
          new Error(
            `PDF parsing failed: ${error.parserError || "Unknown error"}`,
          ),
        );
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error("PDF parsing error details:", {
        message: error instanceof Error ? error.message : String(error),
        filename,
        bufferSize: buffer.length,
      });

      reject(
        new Error(
          `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      );
    }
  });
}

async function parseDOCX(buffer: Buffer, filename: string): Promise<string> {
  try {
    console.log(`Attempting to parse DOCX: ${filename}`);
    const result = await mammoth.extractRawText({ buffer });

    if (!result || !result.value) {
      throw new Error("DOCX parsing returned no text");
    }

    const text = result.value.trim();
    console.log(
      `DOCX parsed successfully: ${text.length} characters extracted`,
    );

    if (text.length === 0) {
      throw new Error("DOCX appears to be empty");
    }

    if (text.length < 50) {
      console.warn(
        `Warning: DOCX text seems unusually short (${text.length} chars)`,
      );
    }

    return text;
  } catch (error) {
    console.error("DOCX parsing error details:", {
      message: error instanceof Error ? error.message : String(error),
      filename,
      bufferSize: buffer.length,
    });

    throw new Error(
      `Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
