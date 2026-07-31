/**
 * Server-side upload validation.
 *
 * Defends against:
 *  - Content-type spoofing (validates real magic bytes, not the declared MIME).
 *  - Stored XSS via SVG / HTML uploaded to a public bucket (these are rejected).
 *  - Executables / scripts / unknown types (rejected — strict allowlist).
 *  - Oversized uploads (size cap per kind).
 *  - Path traversal / unsafe names (filename is generated server-side, never
 *    derived from the client-supplied name).
 */

const MAX_SIZE = {
  image: 5 * 1024 * 1024, // 5 MB
  pdf: 10 * 1024 * 1024, // 10 MB
};

// Allowlist: declared MIME -> safe extension. Anything not listed is rejected.
const ALLOWED = {
  image: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  },
  pdf: {
    "application/pdf": "pdf",
  },
};

/** Raised on any validation failure; carries a client-safe message. */
export class UploadError extends Error {
  constructor(message) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Confirms the file's leading bytes match what the declared MIME type promises.
 * @param {string} mime
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
function magicBytesMatch(mime, bytes) {
  const startsWith = (sig, offset = 0) =>
    sig.every((b, i) => bytes[offset + i] === b);

  switch (mime) {
    case "image/jpeg":
      return startsWith([0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      // "RIFF" .... "WEBP"
      return startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8);
    case "image/avif": {
      // ....ftyp....  with a major/compatible brand of avif/avis/mif1/msf1
      const isFtyp = startsWith([0x66, 0x74, 0x79, 0x70], 4);
      if (!isFtyp) return false;
      const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      return ["avif", "avis", "mif1", "msf1"].includes(brand);
    }
    case "application/pdf":
      // "%PDF-"
      return startsWith([0x25, 0x50, 0x44, 0x46, 0x2d]);
    default:
      return false;
  }
}

/**
 * Validates an uploaded file and returns sanitized metadata + buffer.
 *
 * @param {File | null} file  The file from `formData.get("file")`.
 * @param {"image" | "pdf"} kind
 * @returns {Promise<{ buffer: Buffer, contentType: string, ext: string, size: number }>}
 * @throws {UploadError}
 */
export async function validateUpload(file, kind) {
  const allowlist = ALLOWED[kind];
  const maxSize = MAX_SIZE[kind];
  if (!allowlist) throw new UploadError("Unsupported upload type.");

  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    throw new UploadError("No file provided.");
  }

  const declaredType = (file.type || "").toLowerCase();
  const ext = allowlist[declaredType];
  if (!ext) {
    throw new UploadError(
      kind === "pdf"
        ? "Only PDF files are allowed."
        : "Only JPEG, PNG, WebP or AVIF images are allowed."
    );
  }

  if (typeof file.size === "number" && file.size > maxSize) {
    throw new UploadError(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))} MB.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > maxSize) {
    throw new UploadError(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))} MB.`);
  }
  if (arrayBuffer.byteLength === 0) {
    throw new UploadError("File is empty.");
  }

  const bytes = new Uint8Array(arrayBuffer);
  if (!magicBytesMatch(declaredType, bytes)) {
    // Declared type does not match actual content -> reject (blocks SVG/HTML/script
    // disguised with an image MIME, and other content-type spoofing).
    throw new UploadError("File content does not match its type.");
  }

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: declaredType,
    ext,
    size: arrayBuffer.byteLength,
  };
}
