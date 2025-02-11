"use client";

import { useEffect, useState, useActionState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ContactsCol } from "@/components/demo/dummy-data";
import { LeadStatusDopdown } from "./lead-status-select-dropdown";
import { SelectContact } from "@/models";
import { updateLeadStatus } from "../data-access/contacts";
import { useRouter } from "nextjs-toploader/app";
import { LeadStatusPopover } from "./lead-status-popover";

export function EditableStatusCell({
  value,
  onChange,
  contact
}: {
  value: ContactsCol["leadStatus"];
  onChange: (value: string) => void;
  contact: Partial<SelectContact>;
}) {
  const [localValue, setLocalValue] = useState<
    ContactsCol["leadStatus"] | undefined
  >(undefined);

  const handleStatusChange = async (newValue: string) => {
    onChange(newValue);
    // setLocalValue(newValue as ContactsCol["leadStatus"]);
    await updateLeadStatus({
      id: contact.id as string,
      data: { leadStatus: newValue as ContactsCol["leadStatus"] }
    });
  };

  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    // <LeadStatusDopdown
    //   value={localValue}
    //   defaultValue={value}
    //   onValueChange={handleStatusChange}
    //   name="leadStatus"
    // />
    (<LeadStatusPopover
      value={localValue}
      defaultValue={value}
      onValueChange={handleStatusChange}
      name="leadStatus"
    />)
  );
}
