import { authRequest } from "@/lib/authRequest";
import { EditUserDetailsPayload } from "../type";

export const editUserDetails = (payload: EditUserDetailsPayload) =>{
   return authRequest("/api/user", {method: "PATCH", body: JSON.stringify(payload)})
}