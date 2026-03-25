import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";
import type { Database } from "@/types/database";

type CreateGroupPayload = Database['public']['Tables']['Group']['Insert'];

async function createGroup(userId: string, payload: CreateGroupPayload) {
    const { data, error } = await supabase
        .from("Group")
        .insert({
            createdBy: userId,
            title: payload.title,
            description: payload.description,
            category: payload.category,
            currentAmount: payload.currentAmount,
            status: payload.status,
            targetAmount: payload.targetAmount,
            type: payload.type,
        })
        .select()
        .single();

    if (error) throw error
    return data
}

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    const { session } = useSession();

    const { mutate, mutateAsync, isPending, isError, error, isSuccess } =
        useMutation({
            mutationFn: (payload: CreateGroupPayload) => {
                if (!session?.user.id) throw new Error("No session")
                return createGroup(session.user.id, payload)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["Goal"]})
            },
    })

    return { mutate, mutateAsync, isPending, isError, error, isSuccess }
}
