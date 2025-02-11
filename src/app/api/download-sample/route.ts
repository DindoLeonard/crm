import path from "path";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";

// Define the file path
const filePath = path.join(process.cwd(), "public", "Sample.lead.file.xlsx");

export async function GET() {
  try {
    // Read the file from the filesystem
    const fileBuffer = await fs.readFile(filePath);

    // Set the appropriate headers to download the file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Sample.lead.file.xlsx"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
