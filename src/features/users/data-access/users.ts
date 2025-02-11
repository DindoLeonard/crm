"use server";

import { db } from "@/db";
import { usersGroupsTable, usersTable } from "@/db/schema";
import { and, eq, ilike, asc, desc, sql, or } from "drizzle-orm";
import { CrmRolesEnum, SelectUser } from "@/models";
import { auth } from "@/auth";

import { redirect } from "next/navigation";
interface FetchUsersOptions {
  search?: string;
  sortColumn?: keyof SelectUser; // Updated type-safe approach for column sorting
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  allowedRoles?: CrmRolesEnum[];
}

export async function getUsers({
  search = "",
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"]
}: FetchUsersOptions) {
  if (page < 1) {
    page = 1;
  }
  const offset = (page - 1) * limit;

  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  // Use "or" for searching multiple fields, "and" for chaining where conditions
  const searchCondition = search
    ? or(ilike(usersTable.name, `%${search}%`))
    : undefined;

  // Use "and" for chaining where conditions, "ilike" for case-insensitive search
  const conditions = and(
    // search ? ilike(contactsTable.name, `%${search}%`) : undefined,
    searchCondition
  );

  const results = await db
    .select()
    .from(usersTable)
    .where(conditions) // Combine conditions for filtering
    .orderBy(
      sortOrder === "asc"
        ? asc(usersTable[sortColumn])
        : desc(usersTable[sortColumn])
    )
    .limit(limit)
    .offset(offset); // For pagination

  // Count total results for pagination handling
  const totalCount = await db
    .select({ count: sql<number>`count(*)` }) // SQL to count total rows
    .from(usersTable)
    .where(conditions);

  return {
    results,
    totalCount: totalCount[0]?.count || 0
  };
}

export async function getUserById(id: string) {
  const user = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return user?.[0] || null;
}

export async function getUsersByGroupId({
  groupId,
  allowedRoles = ["admin"]
}: {
  groupId: string;
  allowedRoles: CrmRolesEnum[];
}) {
  try {
    const session = await auth();

    if (!session) {
      redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
      redirect("/unauthorized");
    }

    const users = await db
      .select()
      .from(usersTable)
      .innerJoin(usersGroupsTable, eq(usersTable.id, usersGroupsTable.userId))
      .where(eq(usersGroupsTable.groupId, groupId));

    const results = users.map((record) => record.user);

    return {
      results,
      totalCount: results.length
    };
  } catch (error) {
    console.error("Error fetching users by groupId:", error);
    throw error;
  }
}
