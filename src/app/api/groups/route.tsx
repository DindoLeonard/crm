// app/api/contacts/import-batch/route.ts

import { NextResponse } from "next/server";
import { submitContactBatch } from "@/features/contacts/data-access/contacts";
import { revalidatePath } from "next/cache";
import { getGroups } from "@/features/groups/data-access/groups";

export async function GET(_req: Request) {
  try {
    const groupsResponse = await getGroups({});

    return NextResponse.json(groupsResponse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
