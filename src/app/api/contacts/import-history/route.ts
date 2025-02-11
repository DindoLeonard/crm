// app/api/contacts/import-batch/route.ts

import { NextResponse } from "next/server";
import {
  insertImportHistory,
  saveBase64ToS3,
  submitContactBatch,
  updateImportHistory
} from "@/features/contacts/data-access/contacts";
import { revalidatePath } from "next/cache";
import { uploadFileToS3 } from "@/data-access";
import { BASE_S3_URL } from "@/constants";
import { InsertImportHistory } from "@/models";

export async function POST(req: Request) {
  try {
    const reqBody = (await req.json()) as {
      data: InsertImportHistory;
    };

    const response = await insertImportHistory({
      data: reqBody.data
    });

    revalidatePath("/import/history", "page");
    if (response.success) {
      return NextResponse.json(response, { status: 201 });
    } else {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const reqBody = (await req.json()) as {
      data: Partial<InsertImportHistory>;
      id: string;
    };

    const response = await updateImportHistory({
      data: reqBody.data,
      id: reqBody.id
    });

    revalidatePath("/import/history", "page");
    if (response.success) {
      return NextResponse.json(response, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
