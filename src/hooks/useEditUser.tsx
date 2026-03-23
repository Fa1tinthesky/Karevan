import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase";
import { userKeys } from "../context/SessionContext";
import { useSession } from "../context/SessionContext";

type EditUserPayload = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
};

async function editUser(userId: string, payload: EditUserPayload) {
  const { data, error } = await supabase
    .from("User")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const useEditUser = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, isError, error, isSuccess } =
    useMutation({
      mutationFn: (payload: EditUserPayload) => {
        if (!session?.user.id) throw new Error("No session");
        return editUser(session.user.id, payload);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
    });

  return { mutate, mutateAsync, isPending, isError, error, isSuccess };
};