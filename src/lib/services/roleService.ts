import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client'> {
  // Check admin collection
  const adminRef = doc(db, "admins", uid);
  const adminSnap = await getDoc(adminRef);
  if (adminSnap.exists()) {
    return 'admin';
  }

  // Check caterer collection
  const catererRef = doc(db, "caterers", uid);
  const catererSnap = await getDoc(catererRef);
  if (catererSnap.exists()) {
    return 'caterer';
  }

  // Default to client
  return 'client';
}
