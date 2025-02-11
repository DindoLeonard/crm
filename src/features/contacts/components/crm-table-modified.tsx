"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ContactsCol } from "@/components/demo/dummy-data";
import { CrmRolesEnum, SelectContact, SelectUser } from "@/models";
import { usePathname, useSearchParams } from "next/navigation";
// import { revalidatePageByPath } from "@/actions";
import useDebounce from "@/hooks/use-debounce";
import { useEffect } from "react";
import { CONTACTS_TOTAL_PAGE_SIZE } from "@/constants";
import { EditableStatusCell } from "./editable-status-cell";
import { PaginationIndicator } from "./pagination-indicator-jumper";
import { EditableEmailCell } from "./editable-email-cell";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { RemarksButtonForm } from "./remarks-button";
import { RowActions } from "./row-actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { AssignGroupButton } from "./assign-group-button";
import { AssignUserButton } from "@/features/groups/components/assign-user-button";
import { DeleteContactsButton } from "./delete-contacts-button";
import { Separator } from "@/components/ui/separator";
import { ListTypeButtonGroup } from "@/features/contacts/components/list-type-button-group";
import { MoveToRecycleButton } from "./move-to-recycle-button";

export function ContactsDataTable({
  contacts,
  totalCount = 0,
  page = 1,
  search,
  role = "viewer",
  groupId
}: {
  contacts: (SelectContact & { user?: SelectUser | null })[];
  totalCount?: number;
  page?: number;
  search?: string;
  role?: CrmRolesEnum;
  groupId?: string;
}) {
  const [data, setData] = React.useState<ContactsCol[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ phoneNote: false, emailNote: false });
  const [rowSelection, setRowSelection] = React.useState({});

  const { refresh, replace } = useRouter();
  const pathname = usePathname();
  const path = pathname.split("/")[1];
  const searchParams = useSearchParams();

  const bottomActionOpen = React.useMemo(() => {
    return Object.keys(rowSelection).length > 0;
  }, [rowSelection]);

  const rowsSelected = Object.keys(rowSelection).length;
  const rowsSelectedIds = Object.keys(rowSelection).map((index) => {
    return data[Number(index)]?.id as string;
  });

  const form = useForm();

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (contacts) {
      setData(contacts);
    }
  }, [contacts]);

  const hasNextPage = totalCount > page * CONTACTS_TOTAL_PAGE_SIZE;
  const hasPreviousPage = page > 1;
  const totalPages = Math.ceil(totalCount / CONTACTS_TOTAL_PAGE_SIZE);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      // pagination: { pageIndex: page - 1, pageSize: CONTACTS_TOTAL_PAGE_SIZE },
      columnOrder: [
        "select",
        "name",
        "bookTitle",
        "phone",
        "email",
        "leadStatus"
      ]
    },
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="w-full">
      {role === "admin" && (
        <Sheet modal={false} open={bottomActionOpen}>
          {/* <SheetTrigger>Open</SheetTrigger> */}
          <SheetContent side={"bottom"} hideCloseButton>
            <SheetHeader>
              <SheetTitle>
                {rowsSelected} of {data?.length}
                {`(rows)`} selected.
              </SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>

              {role === "admin" && (
                <div className="space-x-4">
                  {path === "contacts" && rowsSelectedIds?.length > 0 && (
                    <AssignGroupButton
                      contactIds={rowsSelectedIds}
                      onContactAssign={() => {
                        setRowSelection({});
                      }}
                    />
                  )}
                  {path === "imprints" && rowsSelectedIds?.length > 0 && (
                    <AssignUserButton
                      contactIds={rowsSelectedIds}
                      onUserAssign={() => {
                        setRowSelection({});
                      }}
                      groupId={groupId}
                    />
                  )}
                  {rowsSelectedIds?.length > 0 && (
                    <DeleteContactsButton
                      contactIds={rowsSelectedIds}
                      onContactDelete={() => {
                        setRowSelection({});
                      }}
                    />
                  )}

                  {path === "for-recycle" && rowsSelectedIds?.length > 0 && (
                    <MoveToRecycleButton
                      contactIds={rowsSelectedIds}
                      onContactRecycle={() => {
                        setRowSelection({});
                      }}
                    />
                  )}
                </div>
              )}
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
      <div className="flex items-center py-4">
        <SearchTextInput search={search} />

        {pathname === "/contacts/master-list" && (
          <ListTypeButtonGroup
            onListButtonClick={() => {
              setRowSelection({});
            }}
          />
        )}

        <Button
          variant="outline"
          type="button"
          className="ml-auto transform transition-transform duration-300 hover:scale-105 active:scale-95 mr-1"
          onClick={async () => {
            // window.location.reload();
            // await revalidatePageByPath("/");

            refresh();

            // await revalidateX();
          }}
        >
          <RefreshCcw />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" type="button">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => {
                // console.log("column", column);
                // if (column.id === "phoneNote") {
                //   return false;
                // }
                return column.getCanHide();
              })
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <FormField
              control={form.control}
              name="contacts"
              render={() => {
                return (
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                );
              }}
            ></FormField>
            {/* <button type="submit">asldkaskdas</button> */}
          </form>
        </Form>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2 flex">
          <Button
            variant="outline"
            size="sm"
            type="button"
            // onClick={() => table.previousPage()}
            // disabled={!table.getCanPreviousPage()}
            onClick={() => {
              const params = new URLSearchParams(searchParams);

              params.set("page", String(page - 1));

              replace(`${pathname}?${params.toString()}`);
            }}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>

          <PaginationIndicator page={page} totalPages={totalPages} />

          <Button
            variant="outline"
            size="sm"
            type="button"
            // onClick={() => table.nextPage()}
            // disabled={!table.getCanNextPage()}
            onClick={() => {
              const params = new URLSearchParams(searchParams);

              params.set("page", String(Number(page) + 1));

              replace(`${pathname}?${params.toString()}`);
            }}
            disabled={!hasNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function SearchTextInput({ search }: { search?: string }) {
  const [searchText, setSearchText] = React.useState<string>("");

  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchText) {
      params.set("search", debouncedSearchText);
      if (params.has("page")) {
        params.set("page", params.get("page") as string);
      }
    } else if (debouncedSearchText === "") {
      params.delete("search");
    }

    replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchText, pathname, replace, searchParams]);

  const onSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    replace(`${pathname}?${params.toString()}`);

    setSearchText(e.target.value);
  };

  useEffect(() => {
    if (search) {
      setSearchText(search);
    }
  }, [search]);

  return (
    <Input
      placeholder="Search..."
      defaultValue={search}
      onChange={onSearchInput}
      className="max-w-sm mr-1"
    />
  );
}

// Define the columns for the table
export const columns: ColumnDef<ContactsCol>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="mx-3"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="mx-3"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "name",
    header: "Author name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>
  },
  {
    accessorKey: "bookTitle",
    header: "Book Title",
    cell: ({ row }) => <div>{row.getValue("bookTitle")}</div>
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-left">{row.getValue("phone")}</div>
  },
  {
    accessorKey: "email",
    // header: ({ column }) => {
    //   return (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Email
    //       <ArrowUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   );
    // },
    // cell: ({ row, getValue }) => {
    //   const value = getValue() as string;

    //   const updateEmail = (newEmail: string) => {
    //     row.getAllCells().forEach((cell) => {
    //       if (cell.column.id === "email") {
    //         row.original.email = newEmail;
    //       }
    //     });
    //   };

    //   return <EditableEmailCell value={value} onChange={updateEmail} />;
    // }
    header: "Email",
    cell: ({ row }) => (
      <div className="text-left">
        <p className="text-primary-two">{row.getValue("email")}</p>
      </div>
    )
  },
  {
    accessorKey: "user",
    header: "Assigned to",
    cell: ({ row }) => {
      // console.log(row.getValue("userAssignedTo"));
      const user = row.getValue("user") as SelectUser;
      const userName = user?.name || "--";
      return (
        <div className="text-left">
          <p className="text-primary-two">{userName}</p>
        </div>
      );
    }
  },
  {
    accessorKey: "leadStatus",
    // header: "Status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          type="button"
        >
          Status
          {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
        </Button>
      );
    },
    cell: ({ row, getValue }) => {
      //   return <div className="capitalize">{row.getValue("status")}</div>;

      const value = getValue() as ContactsCol["leadStatus"];

      const updateStatus = (newStatus: string) => {
        row.getAllCells().forEach((cell) => {
          if (cell.column.id === "leadStatus") {
            row.original.leadStatus = newStatus as ContactsCol["leadStatus"];
          }
        });
      };

      const contact = row.original;

      return (
        <EditableStatusCell
          value={value}
          contact={contact}
          onChange={updateStatus}
        />
      );
    }
  },
  // {
  //   accessorKey: "remarks",
  //   header: "Remarks",
  //   cell: ({ row, getValue }) => {
  //     // const remarksVal = getValue() as string;
  //     // const emailNoteVal = row.getValue("emailNote") as string;
  //     // const phoneNoteVal = row.getValue("phoneNote") as string;
  //     const contactDetails = row.original;
  //     return (
  //       <>
  //         <RemarksButtonForm contact={contactDetails} />
  //       </>
  //     );
  //   }
  // },
  {
    accessorKey: "phoneNote",
    header: "Phone Note"
    // cell: ({ row }) => <div>{row.getValue("phoneNote")}</div>
  },
  {
    accessorKey: "emailNote",
    header: "Email Note"
    // cell: ({ row }) => <div>{row.getValue("emailNote")}</div>
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const contactDetails = row.original;

      return (
        <div className="flex border rounded p-1 space-x-2">
          <RemarksButtonForm contact={contactDetails} />
          <div>
            <Separator orientation={"vertical"} />
          </div>

          <RowActions contact={contactDetails} />
        </div>
      );
    }
  }
];
