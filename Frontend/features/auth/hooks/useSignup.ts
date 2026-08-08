import {useMutation} from "@tanstack/react-query"
import { signup } from "../api/requests"


export function useSignup() {
    return useMutation({
        mutationFn: signup,
    })
}