// app/api/contacts/import-batch/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  getUsers,
  getUsersByGroupId
} from "@/features/users/data-access/users";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const groupId = searchParams.get("groupId");

    if (groupId) {
      const usersResponse = await getUsersByGroupId({
        groupId,
        allowedRoles: ["admin"]
      });
      return NextResponse.json(usersResponse, { status: 200 });
    }

    const usersResponse = await getUsers({});
    return NextResponse.json(usersResponse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
