"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useActionState } from "react";
import { updateContactsToRecycle } from "../data-access/contacts";
import { toast } from "sonner";
import { FormStatusButton } from "@/components/form-status-button.tsx/form-status-button";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type MoveToRecycleButton = {
  contactIds?: string[];
  onContactRecycle?: () => void;
};

export function MoveToRecycleButton({
  contactIds = [],
  onContactRecycle
}: MoveToRecycleButton) {
  const [formState, formAction] = useActionState(updateContactsToRecycle, {
    status: "idle",
    message: ""
  });

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const listType = params.get("listType");

  useEffect(() => {
    if (formState.status === "success") {
      toast.success(
        `Successfully moved ${contactIds.length} contacts to recycle`
      );
      onContactRecycle?.();
    }
  }, [formState, onContactRecycle]);

  return (
    <>
      <form
        action={formAction}
        className={cn([
          listType === null || listType === "assigned"
            ? "inline-flex"
            : "hidden"
        ])}
      >
        <input
          type="hidden"
          name="contactIds"
          value={JSON.stringify(contactIds)}
        />
        <FormStatusButton
          buttonText="Recycle Contact(s)"
          pendingText="Recycling..."
          submitButtonProps={{ variant: "secondary" }}
        />
      </form>
    </>
  );
}
