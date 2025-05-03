import { Hono } from "hono";
// import { DigitalOceanSpaceService, DigitalOceanSpaceConfig } from "./do-space-service";
import multer from "multer";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { readFileSync, unlinkSync } from "fs";
import { uuidv7 } from "uuidv7";
import { DigitalOceanSpaceConfig, DigitalOceanSpaceService } from "../utils/object_storage";

const handler = new Hono();

// Configuration
const TEMP_UPLOAD_DIR = join(process.cwd(), "temp-uploads");
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure temp upload directory exists
if (!existsSync(TEMP_UPLOAD_DIR)) {
  mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv7()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
})

// Initialize Digital Ocean Spaces service
const spaceConfig: DigitalOceanSpaceConfig = {
  accessKeyId: process.env.DO_OBJECT_STORAGE_ACCESS_KEY!,
  secretAccessKey: process.env.DO_OBJECT_STORAGE_SECRET_KEY!,
  region: process.env.DO_OBJECT_STORAGE_REGION || "SGP1",
  endpoint: process.env.DO_OBJECT_STORAGE_ENDPOINT!,
  bucket: process.env.DO_OBJECT_STORAGE_ROOT_PATH!,
};

const spaceService = new DigitalOceanSpaceService(spaceConfig);

// Utility function to handle upload to DO Spaces
const uploadToSpaces = async (
  localFilePath: string,
  originalFilename: string,
  mimetype: string
) => {
  const fileBuffer = readFileSync(localFilePath);
  const fileExtension = originalFilename.split(".").pop() || "";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}-${uuidv7()}.${fileExtension}`;
  const key = `uploads/${filename}`;

  try {
    const url = await spaceService.uploadFile(
      key,
      fileBuffer,
      mimetype,
      true // Make public
    );

    // Clean up the temporary file
    unlinkSync(localFilePath);

    return {
      url,
      key,
      filename,
      originalFilename,
    };
  } catch (error) {
    // Clean up the temporary file on error
    unlinkSync(localFilePath);
    throw error;
  }
};

// Single image upload endpoint
handler.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof File)) {
      return c.json({ success: false, error: "No image uploaded" }, 400);
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(image.type)) {
      return c.json({
        success: false,
        error: `Unsupported file type: ${image.type}`
      }, 400);
    }

    // Validate file size
    if (image.size > MAX_FILE_SIZE) {
      return c.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, 400);
    }

    // Save to temp file
    const tempFilePath = join(TEMP_UPLOAD_DIR, `${uuidv7()}-${image.name}`);
    const fileArrayBuffer = await image.arrayBuffer();
    writeFileSync(tempFilePath, Buffer.from(fileArrayBuffer));

    const result = await uploadToSpaces(
      tempFilePath,
      image.name,
      image.type
    );

    return c.json({
      success: true,
      message: "File uploaded successfully",
      file: result,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return c.json(
      { success: false, error: "Server error", details: error.message },
      500
    );
  }
});

// Bulk image upload endpoint
handler.post("/bulk-upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const uploadPromises: Promise<any>[] = [];
    const errors: string[] = [];

    // Collect all files with name "images"
    for (const [key, value] of formData.entries()) {
      if (key === "images") {
        const image = value as unknown as File;

        // Validate mime type
        if (!ALLOWED_MIME_TYPES.includes(image.type)) {
          errors.push(`Unsupported file type: ${image.type} for ${image.name}`);
          continue;
        }

        // Validate file size
        if (image.size > MAX_FILE_SIZE) {
          errors.push(`File too large: ${image.name}`);
          continue;
        }

        // Process valid file
        const tempFilePath = join(TEMP_UPLOAD_DIR, `${uuidv7()}-${image.name}`);
        const fileArrayBuffer = await image.arrayBuffer();
        writeFileSync(tempFilePath, Buffer.from(fileArrayBuffer));

        uploadPromises.push(uploadToSpaces(
          tempFilePath,
          image.name,
          image.type
        ));
      }
    }

    if (uploadPromises.length === 0) {
      return c.json({
        success: false,
        error: "No valid images to upload",
        validationErrors: errors
      }, 400);
    }

    const results = await Promise.all(uploadPromises);

    return c.json({
      success: true,
      message: `${results.length} files uploaded successfully`,
      files: results,
      validationErrors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return c.json(
      { success: false, error: "Server error", details: error.message },
      500
    );
  }
});

export default handler;