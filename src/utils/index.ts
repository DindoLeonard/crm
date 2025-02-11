import { InsertContact } from "@/models";

// Assuming you get leadStatus from searchParams query
export function normalizeSearchParamsToArray(
  value: string | string[]
): string[] {
  return value ? (Array.isArray(value) ? value : [value]) : [];
}

export function formatDateTimeToLocale(date: Date): string {
  let userLocale = "en-PH";

  // const userLocale = navigator?.language || "en-GB"; // Fallback to 'en-GB' if locale detection fails
  return new Intl.DateTimeFormat(userLocale, {
    timeZone: "Asia/Manila", // Set the timezone to 'Asia/Manila'
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true // 12-hour format
  }).format(date);
}

export function getInitials(name: string) {
  const [firstName, lastName] = name.split(" ");

  if (firstName && lastName) {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`;
  }

  if (!firstName) {
    return `${lastName?.charAt(0)}`;
  }

  if (!lastName) {
    return `${firstName?.charAt(0)}`;
  }

  return `--`;
}

export function getHowManyDaysSinceDate(date: Date): number {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function toCamelCase(snakeCaseString: string): string {
  return snakeCaseString.replace(/_([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );
}

export function reverseObjectOrder<T extends Record<string, any>>(obj: T): T {
  const reversedEntries = Object.entries(obj).reverse();
  return Object.fromEntries(reversedEntries) as T;
}

/**
 * Checks if a string is not empty, undefined, or null.
 *
 * @param value - The string to validate.
 * @returns True if the string is not empty, undefined, or null, otherwise false.
 */
export function isValidString(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Formats a file name with a timestamp.
 *
 * @param originalFileName - The original name of the file (e.g., "Sales Data.xlsx").
 * @returns A formatted file name with the timestamp appended.
 *          Example: "sales-data-1673031123.xlsx"
 */
export function formatFileNameWithTimestamp(originalFileName: string): string {
  // Get the current timestamp
  const timestamp = Date.now(); // Unix timestamp in milliseconds

  // Extract the file extension
  const fileExtension = originalFileName.substring(
    originalFileName.lastIndexOf(".") + 1
  );

  // Extract the file name without the extension
  const baseFileName =
    originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
    originalFileName;

  // Sanitize the file name (replace spaces with dashes and convert to lowercase)
  const sanitizedFileName = baseFileName.replace(/\s+/g, "-").toLowerCase();

  // Combine the sanitized name, timestamp, and extension
  return `${sanitizedFileName}-${timestamp}.${fileExtension}`;
}

export function formatJsonDataToInsertContactArr(
  jsonData: {
    [key: string]: string;
  }[],
  columnMapping: { [key: string]: string }
): InsertContact[] {
  return (
    jsonData
      .map((obj): InsertContact => {
        const newObj: any = {};
        Object.entries(obj).forEach(([key, value]) => {
          const columnName = columnMapping[key];

          if (columnName === "undefined" || columnName === undefined) {
            return;
          }

          if (columnName === "--" || value === "--") {
            return;
          }

          if (columnName === "phone_note" || columnName === "email_note") {
            if (
              newObj[toCamelCase(columnName)] === undefined ||
              (newObj[toCamelCase(columnName)] === "" &&
                value !== undefined &&
                value !== "")
            ) {
              if (isValidString(String(value))) {
                newObj[toCamelCase(columnName)] = value;
              }
              return;
            }

            if (value) {
              if (typeof value === "string" && value.trim() !== "") {
                newObj[toCamelCase(columnName)] =
                  newObj[toCamelCase(columnName)] + "," + value.trim();
                return;
              }

              newObj[toCamelCase(columnName)] =
                newObj[toCamelCase(columnName)] + "," + String(value).trim();
              return;
            }

            return;
          }

          if (isValidString(String(value))) {
            newObj[toCamelCase(columnName)] = value;
          }
        });
        return newObj;
      })
      .map((obj) => {
        return { ...reverseObjectOrder(obj), leadStatus: "new" };
      }) || []
  );
}
