import {
  contactsTable,
  crmRolesEnum,
  groupsTable,
  importHistoryTable,
  usersTable
} from "@/db/schema";

// CONTACTS
export type SelectContact = typeof contactsTable.$inferSelect;
export type InsertContact = typeof contactsTable.$inferInsert;

export type SelectGroups = typeof groupsTable.$inferSelect;
export type InsertGroups = typeof groupsTable.$inferInsert;

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type CrmRolesEnum = (typeof crmRolesEnum.enumValues)[number];

export type InsertImportHistory = typeof importHistoryTable.$inferInsert;
export type SelectImportHistory = typeof importHistoryTable.$inferSelect;

export type UploadS3RequestType = {
  bucket: string;
  folder: string;
  fileName: string;
  fileBase64: string;
};

export type LeadDataFields =
  | "Imprint"
  | "Book Title"
  | "Phone Number"
  | "Phone Number II"
  | "Phone Number III"
  | "Email"
  | "Email Address"
  | "Author's Name";

export enum LEAD_DATA_FIELDS {
  Imprint = "Imprint",
  BookTitle = "Book Title",
  PhoneNumber = "Phone Number",
  PhoneNumberII = "Phone Number II",
  PhoneNumberIII = "Phone Number III",
  Email = "Email",
  EmailAddress = "Email Address",
  AuthorsName = "Author's Name"
}
