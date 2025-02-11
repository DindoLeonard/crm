"use server";

import { db } from "@/db";
import {
  contactsGroupsTable,
  groupsTable,
  usersGroupsTable,
  usersTable
} from "@/db/schema";
import { and, eq, ilike, asc, desc, sql, or, inArray } from "drizzle-orm";
import { CrmRolesEnum, SelectGroups } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

interface FetchGroupsOptions {
  search?: string;
  sortColumn?: keyof SelectGroups; // Updated type-safe approach for column sorting
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  allowedRoles?: CrmRolesEnum[];
}

export async function getGroups({
  search = "",
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"]
}: FetchGroupsOptions) {
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
    ? or(ilike(groupsTable.groupName, `%${search}%`))
    : undefined;

  // Use "and" for chaining where conditions, "ilike" for case-insensitive search
  const conditions = and(
    // search ? ilike(contactsTable.name, `%${search}%`) : undefined,
    searchCondition
  );

  const results = await db
    .select()
    .from(groupsTable)
    .where(conditions) // Combine conditions for filtering
    .orderBy(
      sortOrder === "asc"
        ? asc(groupsTable[sortColumn])
        : desc(groupsTable[sortColumn])
    )
    .limit(limit)
    .offset(offset); // For pagination

  // Count total results for pagination handling
  const totalCount = await db
    .select({ count: sql<number>`count(*)` }) // SQL to count total rows
    .from(groupsTable)
    .where(conditions);

  return {
    results,
    totalCount: totalCount[0]?.count || 0
  };
}

export async function getGroupsUsersByGroupId(groupId: string) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const results = await db
    .select()
    .from(usersTable)
    .innerJoin(usersGroupsTable, eq(usersTable.id, usersGroupsTable.userId))
    .where(eq(usersGroupsTable.groupId, groupId));

  // return results;
  return results.map((row) => row.user);
}

// Fetch a single group by ID
export async function getGroupById(id: string) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const group = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, id));

  return group?.[0] || [];
}

// Interface for creating a new group
interface CreateGroupData {
  groupName: string;
  description?: string;
}

// Insert a new group
export async function insertGroups({
  groupName,
  description = ""
}: CreateGroupData) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  try {
    // Insert the new group into the database
    await db.insert(groupsTable).values({
      groupName,
      description
    });

    // Revalidate the groups path to update any cache
    revalidatePath("/groups");

    return { success: true };
  } catch (error) {
    console.error("Error inserting group:", error);
    return { success: false, message: "Failed to insert group." };
  }
}

// Interface for updating a group
interface UpdateGroupData {
  id: string; // Group ID
  groupName?: string;
  description?: string;
}

// Update an existing group
export async function updateGroups({
  id,
  groupName,
  description
}: UpdateGroupData) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  try {
    // Prepare the update object by only including fields that have values
    const updateData: Partial<UpdateGroupData> = {};
    if (groupName) updateData.groupName = groupName;
    if (description) updateData.description = description;

    // Update the group record in the database
    await db.update(groupsTable).set(updateData).where(eq(groupsTable.id, id));

    // Revalidate the groups path to update any cache
    revalidatePath("/groups");

    return { success: true };
  } catch (error) {
    console.error("Error updating group:", error);
    return { success: false, message: "Failed to update group." };
  }
}

// Zod schema to validate group creation
const createGroupSchema = z.object({
  groupName: z.string().min(1, "Group name is required").max(100),
  description: z.string().optional()
});

export async function insertGroup(formData: FormData) {
  // Parse and validate form data
  const data = createGroupSchema.parse(Object.fromEntries(formData.entries()));

  // Insert the new group into the database
  await db.insert(groupsTable).values({
    groupName: data.groupName,
    description: data.description || null
  });

  // Revalidate the groups path to reflect the new group
  revalidatePath("/imprints");
  redirect("/imprints");
}

// update group
export async function updateGroup(_currentState: any, formData: FormData) {
  const data = createGroupSchema.parse(Object.fromEntries(formData.entries()));
  const groupId = formData?.get("id") as string;

  _currentState.status = "updating";

  // Update the group record in the database
  await db
    .update(groupsTable)
    .set({
      groupName: data.groupName,
      description: data.description || null
    })
    .where(eq(groupsTable.id, groupId));

  // Revalidate the groups path to update any cache
  revalidatePath("/imprints");
  return { status: "success", message: "Group updated successfully" };
}

// assign contacts to a group
export async function assignContactsToGroup(
  groupId: string,
  contactIds: string[]
) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  try {
    if (groupId && contactIds) {
      const contactGroupRelations = contactIds.map((contactId) => ({
        contactId,
        groupId
      }));

      await db
        .insert(contactsGroupsTable)
        .values(contactGroupRelations)
        .onConflictDoNothing(); // Avoid duplicate contact-group pairs
    }

    // Revalidate the contacts path to update any cache
    revalidatePath("/contacts");

    return { success: true };
  } catch (error) {
    console.error("Error assigning contacts to group:", error);
    return { success: false, message: "Failed to assign contacts to group." };
  }
}

export async function assignUsersToGroup(
  groupId: string,
  userIds: string[]
): Promise<void> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  try {
    if (groupId && userIds) {
      const userGroupRelations = userIds.map((userId) => ({
        userId,
        groupId
      }));

      await db
        .insert(usersGroupsTable)
        .values(userGroupRelations)
        .onConflictDoNothing(); // Avoid duplicate user-group pairs
    }

    // Revalidate the contacts path to update any cache
    revalidatePath("/imprints/groups/${groupId}/members");
  } catch (error) {
    console.error("Error assigning users to group:", error);
  }
}

export async function assignUsersToGroupFormAction(formData: FormData) {
  console.log("Assigning users to group...");
  const groupId = formData.get("groupId") as string;
  const userIds = JSON.parse(formData.get("userIds") as string);

  console.log("groupId", groupId);
  console.log("userIds", userIds);

  await assignUsersToGroup(groupId, userIds);
}

export async function removeUsersFromGroup(
  groupId: string,
  userIds: string[]
): Promise<void> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  try {
    if (groupId && userIds) {
      await db
        .delete(usersGroupsTable)
        .where(
          and(
            inArray(usersGroupsTable.userId, userIds),
            eq(usersGroupsTable.groupId, groupId)
          )
        );
    }

    // Revalidate the contacts path to update any cache
    revalidatePath("/imprints/groups/${groupId}/members");
  } catch (error) {
    console.error("Error assigning users to group:", error);
  }
}

export async function removeUsersFromGroupFormAction(formData: FormData) {
  console.log("Removing users from group...");
  const groupId = formData.get("groupId") as string;
  const userIds = JSON.parse(formData.get("userIds") as string);

  console.log("groupId", groupId);
  console.log("userIds", userIds);

  await removeUsersFromGroup(groupId, userIds);
}