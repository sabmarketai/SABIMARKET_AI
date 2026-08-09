import {useMutation} from "@tanstack/react-query"
import { login } from "../api/requests"
import {toast} from "sonner"

export function useLogin() {
    return useMutation({
        mutationFn: login,
        onSuccess: () => {
            toast.success("Logged in successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })
}