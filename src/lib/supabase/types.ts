export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "ADMIN" | "MANAGER" | "STAFF";
          grade: string | null;
          credits: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: "ADMIN" | "MANAGER" | "STAFF";
          grade?: string | null;
          credits?: number;
          created_at?: string;
        };
        Update: {
          email?: string;
          name?: string;
          role?: "ADMIN" | "MANAGER" | "STAFF";
          grade?: string | null;
          credits?: number;
          created_at?: string;
        };
      };
      evaluation_cycles: {
        Row: {
          id: string;
          title: string;
          starts_on: string;
          ends_on: string;
          allow_peer_review: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          starts_on: string;
          ends_on: string;
          allow_peer_review?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          starts_on?: string;
          ends_on?: string;
          allow_peer_review?: boolean;
          created_at?: string;
        };
      };
      evaluation_items: {
        Row: {
          id: string;
          cycle_id: string | null;
          label: string;
          description: string | null;
          weight: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          cycle_id?: string | null;
          label: string;
          description?: string | null;
          weight?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          cycle_id?: string | null;
          label?: string;
          description?: string | null;
          weight?: number;
          active?: boolean;
          created_at?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          cycle_id: string;
          reviewer_id: string;
          reviewee_id: string;
          type: "SELF" | "PEER" | "MANAGER";
          score: number | null;
          comment: string | null;
          summary_status: "PENDING" | "COMPLETE" | "ERROR";
          summary_positive: string | null;
          summary_negative: string | null;
          summary_suggestions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          reviewer_id: string;
          reviewee_id: string;
          type: "SELF" | "PEER" | "MANAGER";
          score?: number | null;
          comment?: string | null;
          summary_status?: "PENDING" | "COMPLETE" | "ERROR";
          summary_positive?: string | null;
          summary_negative?: string | null;
          summary_suggestions?: string | null;
          created_at?: string;
        };
        Update: {
          cycle_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          type?: "SELF" | "PEER" | "MANAGER";
          score?: number | null;
          comment?: string | null;
          summary_status?: "PENDING" | "COMPLETE" | "ERROR";
          summary_positive?: string | null;
          summary_negative?: string | null;
          summary_suggestions?: string | null;
          created_at?: string;
        };
      };
      credits_ledger: {
        Row: {
          id: string;
          profile_id: string;
          delta: number;
          reason: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          delta: number;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          profile_id?: string;
          delta?: number;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
