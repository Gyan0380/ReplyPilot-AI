import { auth } from "../firebase";

export async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken();
}