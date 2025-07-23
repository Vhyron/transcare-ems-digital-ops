import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllStaff, removeUser } from "../../actions/users.action";
import { createUser } from "@/actions/auth.action";
import { NewStaffFormData } from "@/components/forms/NewStaffForm";

export const useStaffs = () => {
  return useQuery({
    queryKey: ["staffs"],
    queryFn: async () => await listAllStaff(),
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['staffs'],
    mutationFn: async (data: NewStaffFormData) => await createUser(data),
    onSuccess: (res) => {
      if (res.data) {
        queryClient.invalidateQueries({ queryKey: ['staffs'] })
      }
    }
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['staffs'],
    mutationFn: async (id: string) => await removeUser(id),
    onSuccess: (res) => {
      if (res.data) {
        queryClient.invalidateQueries({ queryKey: ['staffs'] })
      }
    }
  })
}
