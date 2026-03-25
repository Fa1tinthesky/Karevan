export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      Group: {
        Row: {
          category: Database["public"]["Enums"]["GroupCategory"] | null
          completedAt: string | null
          contributionAmount: number | null
          createdAt: string
          createdBy: string
          currentAmount: number
          deadline: string | null
          description: string | null
          destination: string | null
          frequency: Database["public"]["Enums"]["GoalFrequency"] | null
          id: string
          nextContributionDate: string | null
          splitType: Database["public"]["Enums"]["SplitType"] | null
          status: Database["public"]["Enums"]["GroupStatus"]
          targetAmount: number
          title: string
          type: Database["public"]["Enums"]["GroupType"]
          updatedAt: string
          visibility: Database["public"]["Enums"]["GoalVisibility"]
        }
        Insert: {
          category?: Database["public"]["Enums"]["GroupCategory"] | null
          completedAt?: string | null
          contributionAmount?: number | null
          createdAt?: string
          createdBy: string
          currentAmount?: number
          deadline?: string | null
          description?: string | null
          destination?: string | null
          frequency?: Database["public"]["Enums"]["GoalFrequency"] | null
          id?: string
          nextContributionDate?: string | null
          splitType?: Database["public"]["Enums"]["SplitType"] | null
          status?: Database["public"]["Enums"]["GroupStatus"]
          targetAmount: number
          title: string
          type: Database["public"]["Enums"]["GroupType"]
          updatedAt?: string
          visibility?: Database["public"]["Enums"]["GoalVisibility"]
        }
        Update: {
          category?: Database["public"]["Enums"]["GroupCategory"] | null
          completedAt?: string | null
          contributionAmount?: number | null
          createdAt?: string
          createdBy?: string
          currentAmount?: number
          deadline?: string | null
          description?: string | null
          destination?: string | null
          frequency?: Database["public"]["Enums"]["GoalFrequency"] | null
          id?: string
          nextContributionDate?: string | null
          splitType?: Database["public"]["Enums"]["SplitType"] | null
          status?: Database["public"]["Enums"]["GroupStatus"]
          targetAmount?: number
          title?: string
          type?: Database["public"]["Enums"]["GroupType"]
          updatedAt?: string
          visibility?: Database["public"]["Enums"]["GoalVisibility"]
        }
        Relationships: [
          {
            foreignKeyName: "Group_createdBy_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GroupContribution: {
        Row: {
          amount: number
          createdAt: string
          groupId: string
          id: string
          memberId: string
          userId: string
        }
        Insert: {
          amount: number
          createdAt?: string
          groupId: string
          id?: string
          memberId: string
          userId: string
        }
        Update: {
          amount?: number
          createdAt?: string
          groupId?: string
          id?: string
          memberId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "GroupContribution_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "Group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "GroupContribution_memberId_fkey"
            columns: ["memberId"]
            isOneToOne: false
            referencedRelation: "GroupMember"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "GroupContribution_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GroupMember: {
        Row: {
          groupId: string
          id: string
          isAdmin: boolean
          joinedAt: string
          lockedAt: string | null
          paidAt: string | null
          shareAmount: number | null
          status: Database["public"]["Enums"]["MemberStatus"]
          totalContributed: number
          updatedAt: string
          userId: string
        }
        Insert: {
          groupId: string
          id?: string
          isAdmin?: boolean
          joinedAt?: string
          lockedAt?: string | null
          paidAt?: string | null
          shareAmount?: number | null
          status?: Database["public"]["Enums"]["MemberStatus"]
          totalContributed?: number
          updatedAt?: string
          userId: string
        }
        Update: {
          groupId?: string
          id?: string
          isAdmin?: boolean
          joinedAt?: string
          lockedAt?: string | null
          paidAt?: string | null
          shareAmount?: number | null
          status?: Database["public"]["Enums"]["MemberStatus"]
          totalContributed?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "GroupMember_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "Group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "GroupMember_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Message: {
        Row: {
          content: string
          createdAt: string
          groupId: string
          id: string
          senderId: string | null
          type: Database["public"]["Enums"]["MessageType"]
        }
        Insert: {
          content: string
          createdAt?: string
          groupId: string
          id?: string
          senderId?: string | null
          type?: Database["public"]["Enums"]["MessageType"]
        }
        Update: {
          content?: string
          createdAt?: string
          groupId?: string
          id?: string
          senderId?: string | null
          type?: Database["public"]["Enums"]["MessageType"]
        }
        Relationships: [
          {
            foreignKeyName: "Message_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "Group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_senderId_fkey"
            columns: ["senderId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          body: string
          createdAt: string
          groupId: string | null
          id: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["NotificationType"]
          userId: string
        }
        Insert: {
          body: string
          createdAt?: string
          groupId?: string | null
          id?: string
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["NotificationType"]
          userId: string
        }
        Update: {
          body?: string
          createdAt?: string
          groupId?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["NotificationType"]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Notification_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "Group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Notification_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          avatarUrl: string | null
          createdAt: string
          email: string
          id: string
          name: string | null
          phone: string | null
          updatedAt: string
          username: string
        }
        Insert: {
          avatarUrl?: string | null
          createdAt?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          updatedAt?: string
          username: string
        }
        Update: {
          avatarUrl?: string | null
          createdAt?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          updatedAt?: string
          username?: string
        }
        Relationships: []
      }
      Wallet: {
        Row: {
          balance: number
          createdAt: string
          currency: string
          id: string
          lockedBalance: number
          updatedAt: string
          userId: string
        }
        Insert: {
          balance?: number
          createdAt?: string
          currency?: string
          id?: string
          lockedBalance?: number
          updatedAt?: string
          userId: string
        }
        Update: {
          balance?: number
          createdAt?: string
          currency?: string
          id?: string
          lockedBalance?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Wallet_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      WalletTransaction: {
        Row: {
          amount: number
          balanceAfter: number
          balanceBefore: number
          createdAt: string
          description: string | null
          groupId: string | null
          id: string
          type: Database["public"]["Enums"]["TransactionType"]
          walletId: string
        }
        Insert: {
          amount: number
          balanceAfter: number
          balanceBefore: number
          createdAt?: string
          description?: string | null
          groupId?: string | null
          id?: string
          type: Database["public"]["Enums"]["TransactionType"]
          walletId: string
        }
        Update: {
          amount?: number
          balanceAfter?: number
          balanceBefore?: number
          createdAt?: string
          description?: string | null
          groupId?: string | null
          id?: string
          type?: Database["public"]["Enums"]["TransactionType"]
          walletId?: string
        }
        Relationships: [
          {
            foreignKeyName: "WalletTransaction_walletId_fkey"
            columns: ["walletId"]
            isOneToOne: false
            referencedRelation: "Wallet"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      GoalFrequency: "DAILY" | "WEEKLY" | "MONTHLY"
      GoalVisibility: "PRIVATE" | "COLLABORATIVE" | "PUBLIC"
      GroupCategory:
        | "RENT"
        | "ELECTRICITY"
        | "WATER"
        | "INTERNET"
        | "TRIP"
        | "GIFT"
        | "OTHER"
      GroupStatus: "ACTIVE" | "COMPLETED" | "FAILED" | "CANCELLED"
      GroupType: "BILL" | "GOAL"
      MemberStatus: "INVITED" | "COMMITTED" | "PAID" | "DECLINED"
      MessageType: "USER" | "SYSTEM"
      NotificationType:
        | "SOMEONE_COMMITTED"
        | "SOMEONE_PAID"
        | "YOU_ARE_LAST"
        | "DEADLINE_APPROACHING"
        | "NO_ACTIVITY_REMINDER"
        | "GROUP_COMPLETE"
        | "GROUP_FAILED"
        | "GOAL_CONTRIBUTION_DUE"
        | "GOAL_MILESTONE"
        | "NEW_INVITE"
      SplitType: "EQUAL" | "CUSTOM"
      TransactionType:
        | "TOPUP"
        | "LOCK"
        | "UNLOCK"
        | "PAYMENT"
        | "CONTRIBUTION"
        | "REWARD"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      GoalFrequency: ["DAILY", "WEEKLY", "MONTHLY"],
      GoalVisibility: ["PRIVATE", "COLLABORATIVE", "PUBLIC"],
      GroupCategory: [
        "RENT",
        "ELECTRICITY",
        "WATER",
        "INTERNET",
        "TRIP",
        "GIFT",
        "OTHER",
      ],
      GroupStatus: ["ACTIVE", "COMPLETED", "FAILED", "CANCELLED"],
      GroupType: ["BILL", "GOAL"],
      MemberStatus: ["INVITED", "COMMITTED", "PAID", "DECLINED"],
      MessageType: ["USER", "SYSTEM"],
      NotificationType: [
        "SOMEONE_COMMITTED",
        "SOMEONE_PAID",
        "YOU_ARE_LAST",
        "DEADLINE_APPROACHING",
        "NO_ACTIVITY_REMINDER",
        "GROUP_COMPLETE",
        "GROUP_FAILED",
        "GOAL_CONTRIBUTION_DUE",
        "GOAL_MILESTONE",
        "NEW_INVITE",
      ],
      SplitType: ["EQUAL", "CUSTOM"],
      TransactionType: [
        "TOPUP",
        "LOCK",
        "UNLOCK",
        "PAYMENT",
        "CONTRIBUTION",
        "REWARD",
      ],
    },
  },
} as const
