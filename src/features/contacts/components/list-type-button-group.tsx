"use client";

import { Separator } from "@/components/ui/separator";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ListTypeButtonGroup({
  onListButtonClick
}: {
  onListButtonClick?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  function onButtonClick(listType: string) {
    const params = new URLSearchParams(searchParams);
    params.set("listType", listType);
    replace(`${pathname}?${params.toString()}`);
    onListButtonClick?.();
  }

  const params = new URLSearchParams(searchParams);

  const listType = params.get("listType");

  return (
    <>
      <div className="flex lg:hidden mr-1">
        <Select value={listType || "assigned"}>
          <SelectTrigger className="w-full capitalize">
            <SelectValue placeholder="List Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                value="assigned"
                onClick={() => onButtonClick("assigned")}
              >
                Assigned
              </SelectItem>
              <SelectItem
                value="unassigned"
                onClick={() => onButtonClick("unassigned")}
              >
                Unassigned
              </SelectItem>
              <SelectItem
                value="recycle"
                onClick={() => onButtonClick("recycle")}
              >
                Recycle List
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full hidden lg:flex lg:min-w-80 lg:max-w-[336px] h-9 mr-1">
        <div className="flex border rounded-lg h-full">
          <div
            className={cn([
              "flex justify-center items-center px-2 min-w-28 cursor-pointer",
              (listType === "assigned" || listType === null) && "bg-muted"
            ])}
            onClick={() => onButtonClick("assigned")}
          >
            <button>Assigned</button>
          </div>

          <div>
            <Separator orientation="vertical" />
          </div>

          <div
            className={cn([
              "flex justify-center items-center px-2 min-w-28 cursor-pointer",
              listType === "unassigned" && "bg-muted"
            ])}
            onClick={() => onButtonClick("unassigned")}
          >
            <button>Unassigned</button>
          </div>

          <div>
            <Separator orientation="vertical" />
          </div>

          <div
            className={cn([
              "flex justify-center items-center px-2 min-w-28 cursor-pointer",
              listType === "recycle" && "bg-muted"
            ])}
            onClick={() => onButtonClick("recycle")}
          >
            <button>Recycle list</button>
          </div>
        </div>
      </div>
    </>
  );
}
