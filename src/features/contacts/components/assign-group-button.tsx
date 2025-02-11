"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useEffect, useState, useActionState } from "react";
import { GroupDropdown } from "./group-dropdown";
import { assignContactsToGroupFormAction } from "../data-access/contacts";
import { FormStatusButton } from "@/components/form-status-button.tsx/form-status-button";
import { toast } from "sonner";
import { SelectGroups } from "@/models";

type AssignButtonProps = {
  contactIds?: string[];
  onContactAssign?: () => void;
};

export function AssignGroupButton({
  contactIds = [],
  onContactAssign
}: AssignButtonProps) {
  const [openGroupSelectModal, setOpenGroupSelectModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SelectGroups | null>(null);

  const [formState, formAction] = useActionState(
    assignContactsToGroupFormAction,
    { status: "idle", message: "" }
  );

  useEffect(() => {
    if (formState.status === "success") {
      toast.success(
        `Successfully added to group "${selectedGroup?.groupName}"`
      );
      setOpenGroupSelectModal(false);
      onContactAssign?.();
    }
  }, [formState, onContactAssign, selectedGroup]);

  function setSelectedGroupFn(group: SelectGroups | null | undefined) {
    if (group) {
      setSelectedGroup(group);
    }
  }

  return (
    <>
      <Dialog
        open={openGroupSelectModal}
        onOpenChange={(status) => {
          setOpenGroupSelectModal(status);
        }}
      >
        <DialogTrigger asChild>
          <Button variant={"secondary"}>Assign Group</Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{
            top: "10%", // Adjust this value as needed
            transform: "translate(-50%, 0)"
          }}
        >
          <DialogHeader>
            <DialogTitle>Assign to a group</DialogTitle>
            <DialogDescription>Select a group</DialogDescription>
          </DialogHeader>
          <form action={formAction} onSubmit={() => {}}>
            <GroupDropdown
              selectedGroupId={selectedGroup?.id}
              setSelectedGroup={setSelectedGroupFn}
            />
            <div className="my-3"></div>
            <input
              hidden
              name="contactIds"
              value={JSON.stringify(contactIds)}
              readOnly
            />
            <DialogFooter>
              <div
                onChange={(e) => {
                  e.stopPropagation();
                }}
              >
                <FormStatusButton
                  buttonText="Save Changes"
                  pendingText="Saving..."
                />
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
