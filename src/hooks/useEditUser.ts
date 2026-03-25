import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabase";
import { userKeys } from "../context/SessionContext";
import { useSession } from "../context/SessionContext";

type EditUserPayload = {
  name?: string;
  phone?: string;
  avatarFile?: File | null; // raw file from input
};

async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true }); // upsert so re-uploads overwrite

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

async function editUser(
  userId: string,
  payload: EditUserPayload,
): Promise<void> {
  const { avatarFile, ...rest } = payload;

  // Build the update object
  const update: Record<string, string | undefined> = { ...rest };

  // If there's a file — upload it first, get the URL
  if (avatarFile) {
    update.avatarUrl = await uploadAvatar(userId, avatarFile);
  }

  const { error } = await supabase.from("User").update(update).eq("id", userId);

  if (error) throw error;
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
