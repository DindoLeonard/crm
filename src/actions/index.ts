"use server";

import { signInFn, signOutFn } from "@/auth";
import { revalidatePath } from "next/cache";

export async function signOut() {
  "use server";

  console.log("signout");
  return signOutFn();
}

export async function signIn() {
  console.log("signin");
  return signInFn();
}

export async function revalidatePageByPath(path: string) {
  revalidatePath(path);
}
