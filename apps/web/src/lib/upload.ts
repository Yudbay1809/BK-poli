import fs from "fs";
import path from "path";

type SavedUpload = {
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

function sanitizeFileName(fileName: string) {
  const cleaned = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned || "file";
}

function resolveUploadDir(subdir: string) {
  const cwd = process.cwd();
  const primaryBase = path.join(cwd, "public", "uploads", subdir);
  const fallbackBase = path.join(cwd, "apps", "web", "public", "uploads", subdir);
  const primaryExists = fs.existsSync(path.join(cwd, "public"));
  return primaryExists ? primaryBase : fallbackBase;
}

export async function saveUploadedFile(file: File, subdir: string): Promise<SavedUpload> {
  const safeName = sanitizeFileName(file.name);
  const timePrefix = Date.now();
  const finalName = `${timePrefix}-${safeName}`;
  const uploadDir = resolveUploadDir(subdir);

  await fs.promises.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, finalName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(filePath, buffer);

  return {
    filePath: `/uploads/${subdir}/${finalName}`,
    fileName: safeName,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}
