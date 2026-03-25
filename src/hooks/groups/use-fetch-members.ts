import supabase from "@/supabase";
import { useCurrentUser } from "@/context/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { useFetchGroups } from "./use-fetch-group";

type MemberRow = {
  groupId: string
  user: { username: string } | { username: string }[] | null
}

async function fetchMembers(groupIds: string[]) {
    const { data, error } = await supabase
        .from("GroupMember")
        .select(`
                id,
                groupId,
                user:User (
                    username
                ),
                isAdmin,
                joinedAt,
                updatedAt,
                shareAmount,
                status,
                lockedAt,
                paidAt,
                totalContributed
                `)
        .in("groupId", groupIds)

    if (error) throw error;
    return (data as MemberRow[]).reduce((acc, member) => {
        const key = member.groupId
        if (!acc[key]) acc[key] = []
            const user = Array.isArray(member.user) ? member.user[0] : member.user
        const initial = user?.username?.[0]?.toUpperCase() ?? "?"

        if (!acc[key].includes(initial)) {
            acc[key].push(initial)
        }
        return acc
    }, {} as Record<string, string[]>)}

export const useFetchMembers = () => {
    const { data: groups, isLoading: isLoadingGroups } = useFetchGroups();

    const groupIds = groups?.map(g => g.id) ?? []

    return useQuery({
        queryKey: ["GroupMember", groupIds],
        queryFn: () => fetchMembers(groupIds),
        enabled: groupIds.length > 0
    })
}
