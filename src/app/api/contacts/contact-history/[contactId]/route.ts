// app/api/contacts/import-batch/route.ts

import { NextResponse } from "next/server";
import {
  getContactUsersHistory,
  submitContactBatch
} from "@/features/contacts/data-access/contacts";

export async function GET(req: Request, props: { params: Promise<{ contactId: string }> }) {
  const params = await props.params;
  try {
    const { contactId } = params;

    const users = await getContactUsersHistory(contactId);

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
