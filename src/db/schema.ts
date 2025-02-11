import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  uuid,
  pgEnum,
  primaryKey,
  unique,
  boolean,
  index
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export enum LeadStatus {
  New = "new",
  NoAnswer = "no_answer",
  NotInService = "not_in_service",
  WrongNumber = "wrong_number",
  DoNotCall = "do_not_call",
  HungUp = "hung_up",
  CallBack = "call_back",
  ChargeBack = "charge_back",
  NotInterested = "not_interested",
  Pipe = "pipe",
  SoldAuthor = "sold_author",
  Refund = "refund",
  Contacts = "contacts"
}

// Define enum for lead status
export const leadStatusEnum = pgEnum("lead_status_enum", [
  "new",
  "no_answer",
  "not_in_service",
  "wrong_number",
  "do_not_call",
  "hung_up",
  "call_back",
  "charge_back",
  "not_interested",
  "pipe",
  "sold_author",
  "refund",
  "contacts"
]);

// Define enum for CRM roles
export const crmRolesEnum = pgEnum("crm_roles_enum", [
  /**
   * --CRUD access
   */
  "admin", // Full access to all CRM features
  /**
   * --can access the contact, do not call, sold, and pipe page only, and update remarks or notes column.
   */
  "sales_rep", // Focus on managing deals, leads, and opportunities
  /**
   * --Can access the assigned team sales_rep sold, pipe, and dashboard report page.
   */
  "team_lead", // Access to marketing campaigns and analytics
  /**
   * -- Can access only the Team_lead page. (all groups sold contact, dashboard reports)
   */
  "sales_director", // Manages customer support and tickets
  /**
   * -- Can access only the Team_lead page. (all groups sold contact, dashboard reports)
   */
  "sales_operations_manager",
  /**
   * -- Can access only the Team_lead page. (all groups sold contact, dashboard reports)
   */
  "ceo",
  /**
   * DEFAULT ROLE
   */
  "viewer" // Read-only access to data
]);

export const contactsTable = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).default("-"),
    name: varchar("name", { length: 255 }).default("-"),
    // firstName: varchar("first_name", { length: 100 }),
    // lastName: varchar("last_name", { length: 100 }),
    phone: varchar("phone", { length: 100 }).default("-"),
    bookTitle: varchar("book_title", { length: 255 }).default("-"),
    leadStatus: leadStatusEnum("lead_status").notNull().default("new"),
    emailNote: text("email_note"),
    phoneNote: text("phone_note"),
    remarks: text("remarks"),
    userAssignedTo: uuid("user_assigned_to").references(() => usersTable.id, {
      onDelete: "set null"
    }),
    dateDecidedForRecycle: timestamp("date_decided_for_recycle"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      precision: 3
    }).$onUpdate(() => new Date()),
    lastDateOfContact: timestamp("last_date_of_contact", {
      mode: "date",
      precision: 3
    })
  },
  (table) => ({
    uniqueContact: unique().on(
      table.email,
      table.name,
      table.phone,
      table.bookTitle
    ),

    // Adding individual indexes
    indexBookTitle: index("idx_book_title").on(table.bookTitle),
    indexName: index("idx_name").on(table.name),
    indexEmail: index("idx_email").on(table.email),
    indexLeadStatus: index("idx_lead_status").on(table.leadStatus),

    // Adding composite index (optional)
    compositeIndex: index("idx_name_bookTitle_email").on(
      table.name,
      table.bookTitle,
      table.email
    )
  })
);

// Define the group table
export const groupsTable = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupName: varchar("group_name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 }).$onUpdate(
    () => new Date()
  )
});

// Define the many-to-many relationship table (contacts_groups)
export const contactsGroupsTable = pgTable(
  "contacts_groups",
  {
    contactId: uuid("contact_id")
      .references(() => contactsTable.id, { onDelete: "cascade" })
      .notNull(),
    groupId: uuid("group_id")
      .references(() => groupsTable.id, { onDelete: "cascade" })
      .notNull(),
    addedAt: timestamp("added_at").defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.contactId, table.groupId] })
  })
);

// Define the users table for authentication
// export const usersTable = pgTable(
//   "users",
//   {
//     id: uuid("id").primaryKey().defaultRandom(),
//     email: varchar("email", { length: 255 }).notNull(),
//     name: varchar("name", { length: 100 }),
//     phone: varchar("phone", { length: 20 }),
//     createdAt: timestamp("created_at").defaultNow(),
//     updatedAt: timestamp("updated_at", {
//       mode: "date",
//       precision: 3
//     }).$onUpdate(() => new Date()),
//     emailVerified: boolean("email_verified").default(false)
//   },
//   (table) => ({
//     uniqueUserEmail: unique().on(table.email)
//   })
// );

export const usersTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  phone: text("phone"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: crmRolesEnum("role").default("viewer"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3
  }).$onUpdate(() => new Date())
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state")
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull()
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull()
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token]
    })
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports")
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID]
    })
  })
);

// Define the table for storing hashed passwords for email/password authentication
export const userCredentialsTable = pgTable(
  "user_credentials",
  {
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId] })
  })
);

// Define the table for storing OAuth provider information (e.g., Google OAuth)
// export const oauthProvidersTable = pgTable(
//   "oauth_providers",
//   {
//     id: serial("id").primaryKey(),
//     userId: uuid("user_id")
//       .references(() => usersTable.id)
//       .notNull(),
//     provider: varchar("provider", { length: 50 }).notNull(), // e.g., "google"
//     providerAccountId: varchar("provider_account_id", {
//       length: 255
//     }).notNull(), // Google account ID
//     accessToken: text("access_token"),
//     refreshToken: text("refresh_token"),
//     expiresAt: timestamp("expires_at"),
//     createdAt: timestamp("created_at").defaultNow()
//   },
//   (table) => ({
//     uniqueProviderAccount: unique().on(table.provider, table.providerAccountId)
//   })
// );

// Define the many-to-many relationship table (users_groups)
export const usersGroupsTable = pgTable(
  "users_groups",
  {
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    groupId: uuid("group_id")
      .references(() => groupsTable.id, { onDelete: "cascade" })
      .notNull(),
    addedAt: timestamp("added_at").defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.groupId] })
  })
);

// Define the many-to-many relationship table (users_contacts)
export const usersContactsTable = pgTable(
  "users_contacts",
  {
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    contactId: uuid("contact_id")
      .references(() => contactsTable.id, { onDelete: "cascade" })
      .notNull(),
    addedAt: timestamp("added_at").defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.contactId] })
  })
);

export const usersContactsRelations = relations(usersTable, ({ many }) => ({
  contacts: many(contactsTable)
}));

export const importHistoryTable = pgTable(
  "import_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    contactsInsertedCount: integer("contacts_inserted_count").notNull(),
    contactsDedupedCount: integer("contacts_deduped_count").notNull(),
    contactsTotalCount: integer("contacts_total_count").notNull(),
    fileName: varchar("file_name", { length: 255 }),
    fileUrl: text("file_url"), // S3 URL
    status: varchar("status", { length: 50 }).notNull().default("pending"), // e.g., "pending", "completed", "failed"
    errorMessage: text("error_message"), // Store error messages if import fails
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      precision: 3
    }).$onUpdate(() => new Date())
  },
  (table) => ({
    userFileIndex: index("idx_user_file").on(table.userId, table.fileName)
  })
);
