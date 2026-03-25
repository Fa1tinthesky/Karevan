import supabase from "@/supabase";
import { useCurrentUser } from "@/context/SessionContext";
import { useQuery } from "@tanstack/react-query";

/**
    * ${describe} Fetches groups for current user */
export async function fetchGroups(userId: string) { 
    const { data, error } = await supabase
        .from("GroupMember")
        .select(
            `
            group:Group(
            id,
            createdBy,
            title,
            description,
            targetAmount,
            currentAmount,
            category,
            status,
            type
            )
        `
        )
        .eq("userId", userId)
        .neq("status", "DECLINED");

        if (error) throw error;

        return data.flatMap(row =>
                                    Array.isArray(row.group) ? row.group : [row.group]).filter(Boolean);
}

export const useFetchGroups = () => {
    const { user, isLoading } = useCurrentUser();

    console.log(user?.id)
    return useQuery({
        queryKey: ['Group', user?.id],
        queryFn: () => fetchGroups(user!.id),
        enabled: !!user?.id // no session - no fetch
    })
}

