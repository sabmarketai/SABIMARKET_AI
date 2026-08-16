import { useMutation, useQueryClient } from "@tanstack/react-query"
import { editUserDetails } from "../api/requests"
import { dashboardKeys } from "@/features/dashboard/api/queryKeys"

export const useEditUserDetails = () =>{
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: editUserDetails,
        onSuccess: () =>{
            queryClient.invalidateQueries({queryKey: dashboardKeys.all})
        }
    })
}