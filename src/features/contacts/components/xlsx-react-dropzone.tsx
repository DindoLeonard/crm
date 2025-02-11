"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  InsertContact,
  InsertImportHistory,
  LEAD_DATA_FIELDS,
  SelectGroups
} from "@/models";
import { submitContactBatch } from "@/features/contacts/data-access/contacts";
import { toast } from "sonner";
import { SampleDownloadButton } from "./sample-file-download-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  formatFileNameWithTimestamp,
  formatJsonDataToInsertContactArr,
  isValidString,
  reverseObjectOrder,
  toCamelCase
} from "@/utils";
import { BASE_S3_URL, BATCH_SIZE } from "@/constants";

const REQUIRED_COLUMNS = [
  "Imprint",
  "Book Title",
  "Phone Number",
  "Phone Number II",
  "Phone Number III",
  "Email",
  "Email Address",
  "Author's Name"
];

const contactsTableColumn = [
  "email",
  "name",
  "phone",
  "book_title",
  // "lead_status",
  "email_note",
  "phone_note",
  "remarks"
];

export function XlsxReactDropzone({ groups }: { groups: SelectGroups[] }) {
  const [parsedData, setParsedData] = useState<InsertContact[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileAsBase64, setFileAsBase64] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SelectGroups | undefined>(
    undefined
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const [headersArr, setHeadersArr] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>(
    {}
  );

  //   const { toast } = useToast();

  //   const processBatch = async (batch: InsertContact[]) => {
  //     const response = await submitContactBatch({ dataBatch: batch });
  //     if (response.success) {
  //       toast({
  //         title: "Batch Processed",
  //         description: `${batch.length} contacts saved successfully.`
  //         // variant: "success",
  //       });
  //     } else {
  //       toast({
  //         title: "Batch Error",
  //         description: "An error occurred while saving the batch.",
  //         variant: "destructive"
  //       });
  //     }
  //   };

  const onDrop = async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile.name.endsWith(".xlsx")) {
      //   toast({
      //     title: "Invalid file type",
      //     description: "Please upload only .xlsx files.",
      //     variant: "destructive"
      //   });
      toast("Invalid file type. Please upload only .xlsx files.");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result;
      if (data instanceof ArrayBuffer) {
        const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonDataXLSX = XLSX.utils.sheet_to_json(worksheet, {
          header: 1
        }) as {
          [key: string]: string;
        }[];

        const headers = jsonDataXLSX[0]; // First row will be the headers
        setHeadersArr(headers as unknown as string[]);
      }
    };
    reader.readAsArrayBuffer(selectedFile);

    // save base64
    const fileAsBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string); // Base64 string
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile); // Read as Base64
    });

    setFileAsBase64(fileAsBase64);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx"
      ]
    },
    multiple: false // Only allow one file
  });

  const removeFile = () => {
    setFile(null);
    setParsedData([]);
    setFileAsBase64(null);
  };

  const handleStatusChange = (newValue: string) => {
    setSelectedGroup(groups.find((group) => group.id === newValue));
  };

  const columnMappingValArr = Object.entries(columnMapping).map(
    ([key, val]) => {
      return val;
    }
  );

  const handleSave = async () => {
    let parsedDataArr: InsertContact[] = [];

    if (
      !columnMappingValArr.includes("email") ||
      !columnMappingValArr.includes("name") ||
      !columnMappingValArr.includes("phone") ||
      !columnMappingValArr.includes("book_title")
    ) {
      toast("Please select all required columns.");
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        setUploading(true);
        const data = event.target?.result;
        if (data instanceof ArrayBuffer) {
          const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonDataXLSX = XLSX.utils.sheet_to_json(worksheet, {
            header: 1
          }) as {
            [key: string]: string;
          }[];

          // const headers = jsonDataXLSX[0]; // First row will be the headers

          const jsonData = XLSX.utils.sheet_to_json(worksheet) as {
            [key: string]: string;
          }[];

          const formattedJsonData = formatJsonDataToInsertContactArr(
            jsonData,
            columnMapping
          );

          parsedDataArr = formattedJsonData;

          let contactsTotalCount = 0;
          let contactsInsertedCount = 0;
          let contactsDedupedCount = 0;

          if (parsedDataArr && file) {
            const formData = new FormData();
            formData.append("file", file);
            if (selectedGroup) {
              formData.append("groupId", selectedGroup.id);
            }
            formData.append("columnMapping", JSON.stringify(columnMapping));

            for (let i = 0; i < parsedDataArr.length; i += BATCH_SIZE) {
              if (parsedDataArr[i] === undefined) {
                break;
              }

              const batch = parsedDataArr.slice(i, i + BATCH_SIZE);
              //   processBatch(batch);

              try {
                const response = await fetch("/api/contacts/import-batch", {
                  method: "POST",
                  body: JSON.stringify({
                    dataBatch: batch,
                    groupId: selectedGroup?.id,
                    base64Content: fileAsBase64
                  }),
                  headers: {
                    "Content-Type": "application/json"
                  },
                  cache: "no-store"
                });

                const responseData = (await response?.json()) as {
                  success: boolean;
                  contactInsertResponse: { id: string }[];
                };

                if (responseData) {
                  contactsTotalCount += batch.length;
                  contactsInsertedCount +=
                    responseData.contactInsertResponse.length;
                  contactsDedupedCount +=
                    batch.length - responseData.contactInsertResponse.length;
                }

                if (response.ok) {
                  toast(
                    `${file.name} processed successfully. - batch(${i} - ${
                      i + BATCH_SIZE
                    })`
                  );
                } else {
                  throw new Error();
                }
              } catch (err) {
                toast(
                  `${file.name} processed unsuccessfully. - batch(${i} - ${
                    i + BATCH_SIZE
                  })`
                );
              }
            }

            // insert initial history
            const insertImportHistory: Partial<InsertImportHistory> = {
              fileName: file.name,
              contactsDedupedCount,
              contactsInsertedCount,
              contactsTotalCount
            };

            const importHistoryResponse = await fetch(
              "/api/contacts/import-history",
              {
                method: "POST",
                body: JSON.stringify({ data: insertImportHistory }),
                headers: {
                  "Content-Type": "application/json"
                },
                cache: "no-store"
              }
            );

            const importHistoryData = (await importHistoryResponse?.json()) as {
              success: boolean;
              id: string;
              userId: string;
            };

            // save to s3
            const formattedFileName = formatFileNameWithTimestamp(file.name);
            await fetch("/api/contacts/upload-contact-base64", {
              method: "POST",
              body: JSON.stringify({
                data: {
                  fileBase64: fileAsBase64,
                  fileName: formattedFileName,
                  folder: undefined // userId, can be undefined
                }
              }),
              headers: {
                "Content-Type": "application/json"
              },
              cache: "no-store"
            });

            // update history
            const updateImportHistory: Partial<InsertImportHistory> = {
              fileUrl: `${BASE_S3_URL}/${importHistoryData.userId}/${formattedFileName}`,
              fileName: file.name,
              status: "completed"
            };

            await fetch(`/api/contacts/import-history`, {
              method: "PUT",
              body: JSON.stringify({
                data: updateImportHistory,
                id: importHistoryData.id
              }),
              headers: {
                "Content-Type": "application/json"
              },
              cache: "no-store"
            });
          }

          setParsedData(formattedJsonData);
          setUploading(false);

          toast(
            `${file.name} processed successfully. - total rows processed (${parsedDataArr.length}).`
          );
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const disableColumnDropdownSelect = (
    selectedColumnsArr: string[],
    columnStr: string
  ) => {
    if (columnStr === "phone_note" || columnStr === "email_note") {
      return false;
    }
    const isSelected = selectedColumnsArr.includes(columnStr);

    return isSelected;
  };

  return (
    <div className="space-y-4">
      <div>
        {groups && (
          <>
            <Select
              value={selectedGroup?.id}
              defaultValue={""}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an Imprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {groups.map((group) => (
                    <SelectItem
                      key={group.id}
                      value={group.id}
                      onClick={() => setSelectedGroup(group)}
                    >
                      {group?.groupName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors",
          isDragActive ? "" : "",
          file ? "border-green-500" : "border-gray-300"
        )}
      >
        <input {...getInputProps()} />
        <p className="mb-4 text-gray-600">
          {isDragActive
            ? "Drop the file here ..."
            : "Drag & drop a single .xlsx file here, or click to select a file"}
        </p>
        <Button>Select .xlsx File</Button>
      </div>

      {file && (
        <div className="">
          {uploading ? (
            <Button className="w-full" disabled>
              Uploading...
            </Button>
          ) : (
            <Button className="w-full" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
      )}

      {file && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="truncate">{file.name}</span>
            <Button variant="destructive" size="sm" onClick={removeFile}>
              Remove
            </Button>
          </div>
        </div>
      )}

      {file && (
        <>
          <div>
            {headersArr.map((header, index) => {
              return (
                <div
                  key={`${header}-${index}`}
                  className="grid grid-cols-2 gap-2 items-center space-y-1"
                >
                  <span className="text-sm font-semibold">{header}</span>
                  <Select
                    value={selectedColumns[index]}
                    defaultValue={""}
                    onValueChange={(newValue) => {
                      const newSelectedColumns = [...selectedColumns];
                      newSelectedColumns[index] = newValue;
                      setSelectedColumns(newSelectedColumns);
                      setColumnMapping((prev) => ({
                        ...prev,
                        [header]: newValue
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="--">--</SelectItem>
                        {contactsTableColumn.map((column) => (
                          <SelectItem
                            key={column}
                            value={column}
                            onClick={() => {
                              // const newSelectedColumns = [...selectedColumns];
                              // newSelectedColumns[index] = column;
                              // setSelectedColumns(newSelectedColumns);
                              setColumnMapping((prev) => ({
                                ...prev,
                                [header]: column
                              }));
                            }}
                            disabled={disableColumnDropdownSelect(
                              selectedColumns,
                              column
                            )}
                          >
                            {column}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </>
      )}

      {parsedData.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Uploaded Data:</h3>
          <pre className="overflow-x-auto p-2 border rounded">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
