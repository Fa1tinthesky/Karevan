import { useState } from "react";
import { Search, X } from "lucide-react";
import { useSearchUsers, type SearchedUser } from "@/hooks/useSearchUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  selectedUsers: SearchedUser[];
  onAdd: (user: SearchedUser) => void;
  onRemove: (userId: string) => void;
};

export const UserSearchInput = ({ selectedUsers, onAdd, onRemove }: Props) => {
  const [query, setQuery] = useState("");
  const { data: results = [], isFetching } = useSearchUsers(query);

  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  return (
    <div className="flex flex-col gap-3">
      {/* Selected users chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30"
            >
              <span className="text-xs font-medium text-primary">
                {u.name ?? u.username}
              </span>
              <button onClick={() => onRemove(u.id)}>
                <X className="w-3 h-3 text-primary" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or phone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
        />
      </div>

      {/* Results dropdown */}
      {query.length >= 2 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isFetching ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No users found
            </p>
          ) : (
            results.map((user) => {
              const alreadyAdded = selectedIds.has(user.id);
              const initials = (user.name ?? user.username)
                .slice(0, 2)
                .toUpperCase();
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    if (!alreadyAdded) {
                      onAdd(user);
                      setQuery("");
                    }
                  }}
                  disabled={alreadyAdded}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors disabled:opacity-40 border-b border-border last:border-0"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatarUrl ?? ""} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {user.name ?? user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                      {user.phone ? ` · ${user.phone}` : ""}
                    </p>
                  </div>
                  {alreadyAdded && (
                    <span className="text-xs text-primary">Added</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
