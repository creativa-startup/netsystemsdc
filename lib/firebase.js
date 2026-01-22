import { auth, db } from "../firebase.config";
import { getStorage } from "firebase/storage";

// Usamos las instancias ya creadas en firebaseClient
export const storage = getStorage();
export { auth, db };