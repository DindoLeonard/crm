"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertGroup, updateGroup } from "@/features/groups/data-access/groups";
import { InsertGroups } from "@/models";
import { useFormStatus } from "react-dom";
import { useEffect, useActionState } from "react";
import { toast } from "sonner";

export function CreateOrUpdateGroupForm({
  groupData,
  type = "create"
}: {
  groupData?: InsertGroups;
  type: "create" | "update";
}) {
  const [formState, formAction] = useActionState(updateGroup, {
    status: "idle",
    message: ""
  });

  console.log("formState", formState);

  useEffect(() => {
    if (formState.status === "success") {
      toast.success("Group updated successfully");
    }
  }, [formState]);

  return (
    <form
      action={type == "update" && groupData ? formAction : insertGroup}
      className="space-y-6 mt-3"
    >
      {groupData && type === "update" && groupData?.id && (
        <input type="hidden" name="id" value={groupData.id} />
      )}
      <div className="space-y-2">
        <label htmlFor="groupName" className="text-sm font-medium">
          Group Name
        </label>
        <Input
          id="groupName"
          name="groupName"
          defaultValue={groupData?.groupName}
          placeholder="Enter group name"
          className="w-full"
          required
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={groupData?.description || ""}
          placeholder="Enter a description (optional)"
          className="w-full"
        />
      </div>

      <SubmitButtonForm type={type} />
    </form>
  );
}

export function SubmitButtonForm({
  type = "create"
}: {
  type?: "create" | "update";
}) {
  const state = useFormStatus();

  const buttonName = type === "update" ? "Update Group" : "Create Group";

  return (
    <Button type="submit" className="mt-4" disabled={state.pending}>
      {state.pending ? "Submitting" : buttonName}
    </Button>
  );
}
