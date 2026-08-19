import { auth } from "../firebase";

export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    // True forces a token refresh if needed
    return await user.getIdToken(true); 
  }
  return null;
};
