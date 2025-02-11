"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InsertUser } from "@/models";
import { useFormStatus } from "react-dom";

export function CreateOrUpdateUserForm({
  userData,
  type = "create"
}: {
  userData?: InsertUser;
  type: "create" | "update";
}) {
  //   const [formState, formAction] = useFormState(updateGroup, {
  //     status: "idle",
  //     message: ""
  //   });

  //   console.log("formState", formState);

  //   useEffect(() => {
  //     if (formState.status === "success") {
  //       toast.success("Group updated successfully");
  //     }
  //   }, [formState]);

  return (
    <form
      //   action={type == "update" && userData ? formAction : insertGroup}
      className="space-y-6 mt-3"
    >
      {userData && type === "update" && userData?.id && (
        <input type="hidden" name="id" value={userData.id} />
      )}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={userData?.name || undefined}
          placeholder="Enter name"
          className="w-full"
          required
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Email
        </label>
        <Textarea
          id="email"
          name="email"
          defaultValue={userData?.email || ""}
          placeholder="Enter email"
          className="w-full"
          autoComplete="off"
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

  const buttonName = type === "update" ? "Update User" : "Create User";

  return (
    <Button
      type="submit"
      className="mt-4"
      // disabled={state.pending}
      disabled
    >
      {state.pending ? "Submitting" : buttonName}
    </Button>
  );
}
