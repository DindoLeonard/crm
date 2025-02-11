// app/api/contacts/import-batch/route.ts

import { NextResponse } from "next/server";
import { submitContactBatch } from "@/features/contacts/data-access/contacts";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { dataBatch, groupId } = await req.json();
    const response = await submitContactBatch({ dataBatch, groupId });

    revalidatePath("/contacts/master-list", "page");
    revalidatePath("/contacts", "page");
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
