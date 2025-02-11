"use server";

import { db } from "@/db";
import {
  contactsGroupsTable,
  contactsTable,
  groupsTable,
  importHistoryTable,
  usersContactsTable,
  usersTable
} from "@/db/schema";
import {
  and,
  eq,
  ilike,
  asc,
  desc,
  sql,
  or,
  ne,
  inArray,
  // notInArray,
  isNotNull,
  isNull,
  is,
  lt,
  gt,
  lte,
  gte
} from "drizzle-orm";
import {
  CrmRolesEnum,
  InsertContact,
  InsertImportHistory,
  SelectContact
} from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { redirect } from "next/navigation";
import { formatDateTimeToLocale } from "@/utils";
import { uploadFileToS3 } from "@/data-access";

type FetchListType =
  | "assigned"
  | "unassigned"
  | "recycle"
  | (string & {})
  | null;

interface FetchContactsOptions {
  search?: string;
  // leadStatus?: SelectContact["leadStatus"] | (string & {});
  leadStatus?: (SelectContact["leadStatus"] | (string & {}))[] | string[];
  sortColumn?: keyof SelectContact; // Updated type-safe approach for column sorting
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  allowedRoles?: CrmRolesEnum[];
  userId?: string;
  groupId?: string;
  listType?: FetchListType;
  days?: number;
  daysOrder?: "lessThan" | "moreThan" | (string & {});
}

export async function exampleQuery() {
  const results = await db
    .select()
    .from(contactsTable)
    .innerJoin(
      usersContactsTable,
      eq(contactsTable.id, usersContactsTable.contactId)
    )
    .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
    .where(eq(usersTable.id, "09b1d1f9-235e-4794-8038-d2c77110a00c"));

  return results.map((row) => row.contacts);
}

export async function getExampleContact() {
  const contactsWithUsers = await db
    .select({
      contact: contactsTable,
      user: usersTable
    })
    .from(contactsTable)
    .leftJoin(
      usersContactsTable,
      eq(usersContactsTable.contactId, contactsTable.id)
    )
    .leftJoin(usersTable, eq(usersTable.id, usersContactsTable.userId));

  return contactsWithUsers;
}

export async function getAllContactsWithUsers() {
  const contactsWithUsers = await db
    .select({
      contactId: contactsTable.id,
      contactName: contactsTable.name,
      contactEmail: contactsTable.email,
      userId: usersTable.id,
      userName: usersTable.name,
      userEmail: usersTable.email
    })
    .from(contactsTable)
    .leftJoin(
      usersContactsTable,
      eq(usersContactsTable.contactId, contactsTable.id)
    )
    .leftJoin(usersTable, eq(usersTable.id, usersContactsTable.userId));

  // Group users by each contact
  const groupedContacts = contactsWithUsers.reduce((acc, row) => {
    const {
      contactId,
      contactName,
      contactEmail,
      userId,
      userName,
      userEmail
    } = row;

    // If the contact doesn't exist in the accumulator, add it with an empty users array
    // @ts-ignore
    if (!acc[contactId]) {
      // @ts-ignore
      acc[contactId] = {
        id: contactId,
        name: contactName,
        email: contactEmail,
        users: []
      };
    }

    // If a user is associated, add the user details to the contact's users array
    if (userId) {
      // @ts-ignore
      acc[contactId].users.push({
        id: userId,
        name: userName,
        email: userEmail
      });
    }

    return acc;
  }, {});

  // Convert the object to an array of contacts
  return Object.values(groupedContacts);
}

export async function getAllContactsWithUsersTwo() {
  const contactsWithUsers = await db
    .select({
      contact: contactsTable,
      userId: usersTable.id,
      userName: usersTable.name,
      userEmail: usersTable.email
    })
    .from(contactsTable)
    .leftJoin(
      usersContactsTable,
      eq(usersContactsTable.contactId, contactsTable.id)
    )
    .leftJoin(usersTable, eq(usersTable.id, usersContactsTable.userId));

  // Group users by each contact
  const groupedContacts = contactsWithUsers.reduce((acc, row) => {
    const { contact, userId, userName, userEmail } = row;

    // If the contact doesn't exist in the accumulator, add it with an empty users array
    // @ts-ignore
    if (!acc[contact.id]) {
      // @ts-ignore
      acc[contact.id] = {
        ...contact,
        users: []
      };
    }

    // If a user is associated, add the user details to the contact's users array
    if (userId) {
      // @ts-ignore
      acc[contact.id].users.push({
        id: userId,
        name: userName,
        email: userEmail
      });
    }

    return acc;
  }, {});

  // Convert the object to an array of contacts
  return Object.values(groupedContacts);
}

export async function getContacts({
  search = "",
  leadStatus = [],
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"],
  userId
}: FetchContactsOptions) {
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

  const isAdmin = session.user?.role === "admin";

  let userIdFromSession;
  if (!isAdmin) {
    userIdFromSession = userId || (session?.user?.id as string);
  }

  if (userId) {
    userIdFromSession = userId;
  }

  // Use "or" for searching multiple fields, "and" for chaining where conditions
  const searchCondition = search
    ? or(
        ilike(contactsTable.name, `%${search}%`),
        ilike(contactsTable.email, `%${search}%`),
        ilike(contactsTable.phone, `%${search}%`),
        ilike(contactsTable.bookTitle, `%${search}%`)
      )
    : undefined;

  // Update the leadStatus condition to handle an array
  const leadStatusCondition = leadStatus.length
    ? inArray(
        contactsTable.leadStatus,
        leadStatus as SelectContact["leadStatus"][]
      )
    : undefined;

  // if userId is present, filter contacts by userId
  // const userIdCondition = userId
  //   ? eq(usersContactsTable.userId, userId)
  //   : undefined;

  // Use "and" for chaining where conditions, "ilike" for case-insensitive search
  let conditions = and(
    // search ? ilike(contactsTable.name, `%${search}%`) : undefined,
    searchCondition,
    // leadStatus
    //   ? ne(contactsTable.leadStatus, "new" as SelectContact["leadStatus"])
    //   : undefined
    leadStatusCondition
    // userIdCondition
  );

  if (userIdFromSession) {
    // this is an example of joining tables to filter contacts by userId
    conditions = and(
      searchCondition,
      leadStatusCondition,
      // userIdCondition,
      eq(usersContactsTable.userId, userIdFromSession) // Filter by userId
    );
    const searchQueryResponse = await db
      .select()
      .from(contactsTable)
      .innerJoin(
        usersContactsTable,
        eq(contactsTable.id, usersContactsTable.contactId)
      )
      .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
      .where(conditions)
      // .orderBy(
      //   sortOrder === "asc"
      //     ? asc(contactsTable[sortColumn])
      //     : desc(contactsTable[sortColumn])
      // )
      .orderBy(asc(contactsTable.updatedAt))
      .limit(limit)
      .offset(offset);

    const results = searchQueryResponse.map((row) => ({
      ...row.contacts,
      user: row.user
    }));

    const totalCount = await db
      .select({ count: sql<number>`count(*)` }) // SQL to count total rows
      .from(contactsTable)
      .innerJoin(
        usersContactsTable,
        eq(contactsTable.id, usersContactsTable.contactId)
      )
      .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
      .where(conditions);

    return { results, totalCount: totalCount?.[0]?.count || 0 };
  }

  const queryResults = await db
    .select()
    .from(contactsTable)
    .leftJoin(usersTable, eq(contactsTable.userAssignedTo, usersTable.id))
    .where(conditions) // Combine conditions for filtering
    // .orderBy(
    //   sortOrder === "asc"
    //     ? asc(contactsTable[sortColumn])
    //     : desc(contactsTable[sortColumn])
    // )
    .orderBy(asc(contactsTable.updatedAt))
    .limit(limit)
    .offset(offset); // For pagination

  // Count total results for pagination handling
  const totalCount = await db
    .select({ count: sql<number>`count(*)` }) // SQL to count total rows
    .from(contactsTable)
    .leftJoin(usersTable, eq(contactsTable.userAssignedTo, usersTable.id))
    .where(conditions);

  const results = queryResults.map((row) => {
    return { ...row.contacts, user: row.user };
  });

  // revalidatePath("/contacts");

  return {
    results,
    totalCount: Number(totalCount[0]?.count) || 0
  };
}

export async function getContactsForRecycle({
  search = "",
  leadStatus = [],
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"],
  daysOrder = "lessThan",
  days,
  userId
}: FetchContactsOptions) {
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

  const isAdmin = session.user?.role === "admin";

  let userIdFromSession;
  if (!isAdmin) {
    userIdFromSession = userId || (session?.user?.id as string);
  }

  if (userId) {
    userIdFromSession = userId;
  }

  const searchCondition = search
    ? or(
        ilike(contactsTable.name, `%${search}%`),
        ilike(contactsTable.email, `%${search}%`),
        ilike(contactsTable.phone, `%${search}%`),
        ilike(contactsTable.bookTitle, `%${search}%`)
      )
    : undefined;

  const leadStatusCondition = leadStatus.length
    ? inArray(
        contactsTable.leadStatus,
        leadStatus as SelectContact["leadStatus"][]
      )
    : undefined;

  const recycleCondition = and(isNull(contactsTable.dateDecidedForRecycle));

  const targetDate = new Date();
  if (days) {
    targetDate.setDate(targetDate.getDate() - days);
  }

  let daysCondition;
  switch (daysOrder) {
    case "moreThan":
      daysCondition = lt(contactsTable.updatedAt, targetDate);
      break;
    case "lessThan":
      daysCondition = gte(contactsTable.updatedAt, targetDate);
      break;
  }

  let conditions = and(
    searchCondition,
    leadStatusCondition,
    recycleCondition,
    days ? daysCondition : undefined
  );

  if (userIdFromSession) {
    conditions = and(
      searchCondition,
      leadStatusCondition,
      eq(usersContactsTable.userId, userIdFromSession)
    );

    const searchQueryResponse = await db
      .select()
      .from(contactsTable)
      .innerJoin(
        usersContactsTable,
        eq(contactsTable.id, usersContactsTable.contactId)
      )
      .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
      .where(conditions)
      .orderBy(asc(contactsTable.updatedAt))
      .limit(limit)
      .offset(offset);

    const results = searchQueryResponse.map((row) => ({
      ...row.contacts,
      user: row.user
    }));

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactsTable)
      .innerJoin(
        usersContactsTable,
        eq(contactsTable.id, usersContactsTable.contactId)
      )
      .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
      .where(conditions);

    return { results, totalCount: totalCount?.[0]?.count || 0 };
  }

  const queryResults = await db
    .select()
    .from(contactsTable)
    .leftJoin(usersTable, eq(contactsTable.userAssignedTo, usersTable.id))
    .where(conditions)
    .orderBy(asc(contactsTable.updatedAt))
    .limit(limit)
    .offset(offset);

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactsTable)
    .leftJoin(usersTable, eq(contactsTable.userAssignedTo, usersTable.id))
    .where(conditions);

  const results = queryResults.map((row) => ({
    ...row.contacts,
    user: row.user
  }));

  // revalidatePath("/contacts", "page");

  return {
    results,
    totalCount: Number(totalCount[0]?.count) || 0
  };
}

export async function getContactsForMasterList({
  search = "",
  leadStatus = [],
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"],
  listType = null,
  userId
}: FetchContactsOptions) {
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

  const searchCondition = search
    ? or(
        ilike(contactsTable.name, `%${search}%`),
        ilike(contactsTable.email, `%${search}%`),
        ilike(contactsTable.phone, `%${search}%`),
        ilike(contactsTable.bookTitle, `%${search}%`)
      )
    : undefined;

  const leadStatusCondition = leadStatus.length
    ? inArray(
        contactsTable.leadStatus,
        leadStatus as SelectContact["leadStatus"][]
      )
    : undefined;

  let conditions = and(searchCondition, leadStatusCondition);

  // conditions = and(
  //   searchCondition,
  //   leadStatusCondition,
  //   isNotNull(contactsTable.userAssignedTo)
  // );

  // default new
  conditions = and(
    searchCondition,
    leadStatusCondition,
    isNotNull(contactsTable.userAssignedTo)
  );

  if (listType === "unassigned") {
    conditions = and(
      searchCondition,
      leadStatusCondition,
      isNull(contactsTable.userAssignedTo),
      isNull(contactsTable.dateDecidedForRecycle)
    );
  }

  if (listType === "recycle") {
    conditions = and(
      searchCondition,
      leadStatusCondition,
      isNull(contactsTable.userAssignedTo),
      isNotNull(contactsTable.dateDecidedForRecycle)
    );
  }

  // assigned
  const queryResults = await db
    .select()
    .from(contactsTable)
    .leftJoin(usersTable, eq(contactsTable.userAssignedTo, usersTable.id))
    .where(conditions)
    .orderBy(asc(contactsTable.updatedAt))
    .limit(limit)
    .offset(offset);

  const totalCount = await db
    .select({ count: sql<number>`count(*)` }) // SQL to count total rows
    .from(contactsTable)
    .where(conditions);

  const result = queryResults.map((row) => {
    return { ...row.contacts, user: row.user };
  });

  // revalidatePath("/contacts");

  return {
    results: [...result],
    totalCount: Number(totalCount?.[0]?.count) || 0
  };
}

export async function getContactUsersHistory(contactId: string) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  const queryResults = await db
    .select()
    .from(usersContactsTable)
    .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
    .where(eq(usersContactsTable.contactId, contactId))
    .orderBy(desc(usersContactsTable.addedAt));

  const results = queryResults.map((row) => row.user);

  return results;
}

export async function getContactsByUser({
  search = "",
  leadStatus = [],
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"],
  listType = null
}: FetchContactsOptions) {
  if (page < 1) {
    page = 1;
  }
  const offset = (page - 1) * limit;

  const session = await auth();

  const userIdFromSession = session?.user?.id as string;

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  // Use "or" for searching multiple fields, "and" for chaining where conditions
  const searchCondition = search
    ? or(
        ilike(contactsTable.name, `%${search}%`),
        ilike(contactsTable.email, `%${search}%`),
        ilike(contactsTable.phone, `%${search}%`),
        ilike(contactsTable.bookTitle, `%${search}%`)
      )
    : undefined;

  // Update the leadStatus condition to handle an array
  const leadStatusCondition = leadStatus.length
    ? inArray(
        contactsTable.leadStatus,
        leadStatus as SelectContact["leadStatus"][]
      )
    : undefined;

  // if userId is present, filter contacts by userId
  const userIdCondition = userIdFromSession
    ? eq(usersContactsTable.userId, userIdFromSession)
    : undefined;

  // Use "and" for chaining where conditions, "ilike" for case-insensitive search
  let conditions = and(
    // search ? ilike(contactsTable.name, `%${search}%`) : undefined,
    searchCondition,
    // leadStatus
    //   ? ne(contactsTable.leadStatus, "new" as SelectContact["leadStatus"])
    //   : undefined
    leadStatusCondition,
    userIdCondition
  );

  // this is an example of joining tables to filter contacts by userId
  conditions = and(
    searchCondition,
    leadStatusCondition,
    userIdCondition,
    eq(usersContactsTable.userId, session.user?.id as string)
  );

  const queryResults = await db
    .select()
    .from(contactsTable)
    .innerJoin(
      usersContactsTable,
      eq(contactsTable.id, usersContactsTable.contactId)
    )
    .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
    .where(conditions)
    .orderBy(
      sortOrder === "asc"
        ? asc(contactsTable[sortColumn])
        : desc(contactsTable[sortColumn])
    )
    .limit(limit)
    .offset(offset);

  const results = queryResults.map((row) => row.contacts);

  const totalCount = await db
    .select({ count: sql<number>`count(*)` }) // SQL to count total rows
    .from(contactsTable)
    .innerJoin(
      usersContactsTable,
      eq(contactsTable.id, usersContactsTable.contactId)
    )
    .innerJoin(usersTable, eq(usersContactsTable.userId, usersTable.id))
    .where(conditions);

  return { results, totalCount: totalCount?.[0]?.count || 0 };
}

export async function getContactsByGroupId({
  search = "",
  leadStatus = [],
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"],
  groupId
}: FetchContactsOptions) {
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
    ? or(
        ilike(contactsTable.name, `%${search}%`),
        ilike(contactsTable.email, `%${search}%`),
        ilike(contactsTable.phone, `%${search}%`),
        ilike(contactsTable.bookTitle, `%${search}%`)
      )
    : undefined;

  // Update the leadStatus condition to handle an array
  const leadStatusCondition = leadStatus.length
    ? inArray(
        contactsTable.leadStatus,
        leadStatus as SelectContact["leadStatus"][]
      )
    : undefined;

  // if groupId is present, filter contacts by groupId
  const groupIdCondition = groupId
    ? eq(contactsGroupsTable.groupId, groupId)
    : undefined;

  // Use "and" for chaining where conditions, "ilike" for case-insensitive search
  let conditions = and(
    // search ? ilike(contactsTable.name, `%${search}%`) : undefined,
    searchCondition,
    // leadStatus
    //   ? ne(contactsTable.leadStatus, "new" as SelectContact["leadStatus"])
    //   : undefined
    leadStatusCondition,
    groupIdCondition
  );

  const contactsQueryResponse = await db
    .select()
    .from(contactsTable)
    .innerJoin(
      contactsGroupsTable,
      eq(contactsTable.id, contactsGroupsTable.contactId)
    )
    .leftJoin(usersTable, eq(contactsTable.userAssignedTo, usersTable.id))
    .where(conditions) // Combine conditions for filtering
    .orderBy(asc(contactsTable.updatedAt))
    .limit(limit)
    .offset(offset); // For pagination

  const results = contactsQueryResponse.map((row) => ({
    ...row.contacts,
    user: row.user
  }));

  // Count total results for pagination handling
  const totalCount = await db
    .select({ count: sql<number>`count(*)` }) // SQL to count total rows
    .from(contactsTable)
    .innerJoin(
      contactsGroupsTable,
      eq(contactsTable.id, contactsGroupsTable.contactId)
    )
    .leftJoin(usersTable, eq(contactsTable.userAssignedTo, usersTable.id))
    .where(conditions);

  return {
    results,
    totalCount: totalCount[0]?.count || 0
  };
}

export async function deleteAllContacts() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  try {
    // Drizzle ORM delete all rows
    const response = await db.delete(contactsTable);
    // return { success: true, response };

    revalidatePath("/contacts/master-list", "page");
  } catch (error) {
    console.error("Delete All Error:", error);
    return { success: false, error };
  }
}

export async function deleteContactsFormAction(
  currentState: any,
  formData: FormData
) {
  if (!formData) {
    return { status: "error", message: "Form data is required." };
  }
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  try {
    // Drizzle ORM delete row
    const contactIdsString = formData.get("contactIds")?.toString();
    if (contactIdsString) {
      const contactIds = JSON.parse(contactIdsString) as string[];

      const response = await db
        .delete(contactsTable)
        .where(inArray(contactsTable.id, contactIds));

      revalidatePath("/contacts/master-list", "page");
      return {
        status: "success",
        message: `Successfully deleted ${contactIds.length} contacts`
      };
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return {
      status: "error",
      message: "Error deleting contacts"
    };
  }
}

export async function submitContactBatch({
  dataBatch,
  groupId
}: {
  dataBatch: InsertContact[];
  groupId?: string;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  try {
    // console.log("Batch Insert Data:", dataBatch);
    // Drizzle ORM batch insert with conflict resolution
    const contactInsertResponse = await db
      .insert(contactsTable)
      .values(dataBatch)
      .onConflictDoNothing()
      .returning({ id: contactsTable.id }); // Skip conflicting rows

    // If groupId is present, create a relationship in contacts_groups table
    if (groupId && contactInsertResponse.length) {
      const contactIds = contactInsertResponse.map(
        (contact) => contact.id as string
      );
      const contactGroupRelations = contactIds.map((contactId) => ({
        contactId,
        groupId
      }));

      await db
        .insert(contactsGroupsTable)
        .values(contactGroupRelations)
        .onConflictDoNothing(); // Avoid duplicate contact-group pairs
    }

    revalidatePath("/contacts/master-list", "page");
    // revalidatePath("/contacts", "page");
    return { success: true, contactInsertResponse };
  } catch (error) {
    console.error("Batch Insert Error:", error);
    return { success: false, error };
  }
}

export async function saveBase64ToS3(
  base64Content: string,
  fileName: string,
  folder: string
) {
  // Save base64 content to S3
  if (!base64Content) {
    throw new Error("Base64 content is required.");
  }

  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  const userId = session.user?.id as string;

  try {
    // Save base64 content to S3
    if (userId) {
      await uploadFileToS3(
        process.env.AWS_S3_BUCKET_NAME,
        userId,
        fileName,
        base64Content
      );
    }

    return { success: true };
  } catch (err) {
    const errorObj = err as Error;
    console.error("Save Base64 Error:", errorObj.message);
    return { success: false, error: errorObj.message };
  }
}

// create contacts_groups relation
export async function createContactGroupRelation({
  contactId,
  groupId
}: {
  contactId: string;
  groupId: string;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  try {
    // Drizzle ORM insert row
    const response = await db
      .insert(contactsGroupsTable)
      .values({ contactId, groupId });

    revalidatePath("/contacts/master-list", "page");
    return { success: true, response };
  } catch (error) {
    console.error("Create Relation Error:", error);
    return { success: false, error };
  }
}

// update contact
export async function updateContact({
  id,
  data
}: {
  id: string;
  data: Partial<SelectContact>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  try {
    // Drizzle ORM update row
    const response = await db
      .update(contactsTable)
      .set(data)
      .where(eq(contactsTable.id, id));

    revalidatePath("/contacts/master-list", "page");
    revalidatePath("/contacts", "page");
    return { success: true, response };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error };
  }
}

export async function updateLeadStatus({
  id,
  data
}: {
  id: string;
  data: Partial<SelectContact>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const dataAllowed = {
    leadStatus: data.leadStatus
  };

  try {
    // Drizzle ORM update row
    const response = await db
      .update(contactsTable)
      .set(dataAllowed)
      .where(eq(contactsTable.id, id));

    revalidatePath("/contacts/master-list", "page");
    revalidatePath("/contacts", "page");
  } catch (error) {
    console.error("Update Error:", error);
  }
}

// update contact form action
export async function updateContactFormAction(
  // contactId: string,
  state: any,
  formData: FormData
) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const role = session.user?.role as CrmRolesEnum;

  // if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
  //   redirect("/unauthorized");
  // }

  const contactId = formData.get("contactId")?.toString();

  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const booktTitle = formData.get("bookTitle")?.toString();
  const phone = formData.get("phone")?.toString();
  const leadStatus = formData.get("leadStatus")?.toString();
  const remarks = formData.get("remarks")?.toString();
  const emailNote = formData.get("emailNote")?.toString();
  const phoneNote = formData.get("phoneNote")?.toString();
  const addRemarks = formData.get("addRemarks")?.toString();

  if (!contactId) {
    return { success: false, error: "Contact ID is required.", message: "" };
  }

  const selectContactFormData: InsertContact = {};

  if (name && role === "admin") {
    selectContactFormData.name = name;
  }
  if (email && role === "admin") {
    selectContactFormData.email = email;
  }
  if (booktTitle && role === "admin") {
    selectContactFormData.bookTitle = booktTitle;
  }
  if (phone && role === "admin") {
    selectContactFormData.phone = phone;
  }

  if (leadStatus) {
    selectContactFormData.leadStatus =
      leadStatus as SelectContact["leadStatus"];
  }

  if (addRemarks) {
    const normalize = (str?: string) => {
      if (!str) return "";
      return str.replace(/\r\n/g, "\n");
    };
    if (normalize(addRemarks)) {
      selectContactFormData.remarks =
        (remarks ? normalize(remarks) : "") +
        "\n" +
        normalize(addRemarks) +
        "\n" +
        `${session.user?.name}` +
        " - " +
        formatDateTimeToLocale(new Date());
      +"\n";
    }
  }

  if (emailNote) {
    selectContactFormData.emailNote = emailNote;
  }
  if (phoneNote) {
    selectContactFormData.phoneNote = phoneNote;
  }

  try {
    // Drizzle ORM update row
    const response = await db
      .update(contactsTable)
      .set(selectContactFormData)
      .where(eq(contactsTable.id, contactId.toString()));

    revalidatePath("/contacts/master-list", "page");
    return {
      success: true,
      message: "Form submitted successfully!",
      error: null
    };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error, data: null };
  }
}

// assign contacts to group form submission
export async function assignContactsToGroupFormAction(
  currentState: any,
  formData: FormData
) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  const groupId = formData.get("groupId")?.toString();
  const contactIdsString = formData.get("contactIds")?.toString();
  if (contactIdsString && groupId) {
    const contactIds = JSON.parse(contactIdsString) as string[];

    const contactGroupRelations = contactIds.map((contactId) => ({
      contactId,
      groupId
    }));

    try {
      await db
        .insert(contactsGroupsTable)
        .values(contactGroupRelations)
        .onConflictDoNothing();
      return { status: "success", message: "Form submitted successfully!" };
    } catch (err) {
      console.error("Assign Group Error:", err);
      return { status: "error", message: "Error assigning group." };
    }
  }

  return { status: "success", message: "Form submitted successfully!" };
}

export async function updateContactsToRecycle(
  currentState: any,
  formData: FormData
) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  const contactIdsString = formData.get("contactIds")?.toString();
  if (contactIdsString) {
    const contactIds = JSON.parse(contactIdsString) as string[];

    try {
      // update date_decided_for_recycle
      // update and remove user_assigned_to
      await db
        .update(contactsTable)
        .set({
          dateDecidedForRecycle: sql`NOW()`,
          userAssignedTo: null
        })
        .where(inArray(contactsTable.id, contactIds));

      revalidatePath("/contacts/master-list", "page");
      revalidatePath("/imprints/groups/[groupId]/contacts", "page");

      return { status: "success", message: "Form submitted successfully!" };
    } catch (err) {
      console.error("Assign Group Error:", err);
      return { status: "error", message: "Error assigning group." };
    }
  }

  return { status: "success", message: "Form submitted successfully!" };
}

// assign contacts to groups
export async function assignContactsToUsersFormAction(
  currentState: any,
  formData: FormData
) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  const userId = formData.get("userId")?.toString();

  if (!userId) {
    return { status: "error", message: "Select user" };
  }

  const contactIdsString = formData.get("contactIds")?.toString();
  if (contactIdsString && userId) {
    const contactIds = JSON.parse(contactIdsString) as string[];

    const contactUsersRelations = contactIds.map((contactId) => ({
      contactId,
      userId
    }));

    try {
      await db
        .update(contactsTable)
        .set({ userAssignedTo: userId })
        .where(inArray(contactsTable.id, contactIds));

      await db
        .insert(usersContactsTable)
        .values(contactUsersRelations)
        .onConflictDoUpdate({
          target: [usersContactsTable.contactId, usersContactsTable.userId],
          set: { addedAt: sql`NOW()` }
        });

      revalidatePath("/contacts/master-list", "page");
      revalidatePath("/imprints/groups/[groupId]/contacts", "page");

      return { status: "success", message: "Form submitted successfully!" };
    } catch (err) {
      console.error("Assign Group Error:", err);
      return { status: "error", message: "Error assigning group." };
    }
  }

  return { status: "success", message: "Form submitted successfully!" };
}

export async function insertImportHistory({
  data
}: {
  data: InsertImportHistory;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  if (!session.user?.id) {
    return { success: false, error: "User ID is required." };
  }

  try {
    const response = await db
      .insert(importHistoryTable)
      .values({ ...data, userId: session.user?.id })
      .returning({ id: importHistoryTable.id });

    return { success: true, id: response[0].id, userId: session.user?.id };
  } catch (error) {
    console.error("Insert Import History Error:", error);
    return { success: false, error };
  }
}

export async function updateImportHistory({
  id,
  data
}: {
  id: string;
  data: Partial<InsertImportHistory>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const allowedRoles = ["admin"];

  if (!allowedRoles.includes(session.user?.role as CrmRolesEnum)) {
    redirect("/unauthorized");
  }

  try {
    await db
      .update(importHistoryTable)
      .set(data)
      .where(eq(importHistoryTable.id, id));

    return { success: true };
  } catch (error) {
    console.error("Update Import History Error:", error);
    return { success: false, error };
  }
}

export async function getImportHistory({
  search = "",
  sortColumn = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  allowedRoles = ["admin"]
}: FetchContactsOptions) {
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

  const searchCondition = search
    ? or(
        ilike(importHistoryTable.fileName, `%${search}%`),
        ilike(importHistoryTable.status, `%${search}%`)
      )
    : undefined;

  const conditions = and(searchCondition);

  const queryResults = await db
    .select()
    .from(importHistoryTable)
    .innerJoin(usersTable, eq(importHistoryTable.userId, usersTable.id))
    .where(conditions)
    .orderBy(desc(importHistoryTable.updatedAt))
    .limit(limit)
    .offset(offset);

  const totalCount = await db
    .select({ count: sql<number>`count(*)` }) // SQL to count total rows
    .from(importHistoryTable)
    .where(conditions);

  const results = queryResults.map((row) => ({
    ...row.import_history,
    user: row.user
  }));

  return {
    results: results,
    totalCount: totalCount?.[0]?.count || 0
  };
}
