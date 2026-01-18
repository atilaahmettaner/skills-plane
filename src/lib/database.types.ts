export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    is_verified: boolean
                    updated_at: string | null
                    type: "individual" | "organization"
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    is_verified?: boolean
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    is_verified?: boolean
                    updated_at?: string | null
                }
            }
            skills: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    description: string | null
                    content: string | null
                    files: Json | null
                    author_id: string
                    is_official: boolean
                    github_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    description?: string | null
                    content?: string | null
                    files?: Json | null
                    author_id: string
                    is_official?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    description?: string | null
                    content?: string | null
                    files?: Json | null
                    author_id?: string
                    is_official?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            rules: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    description: string | null
                    content: string | null
                    files: Json | null
                    author_id: string
                    is_official: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    description?: string | null
                    content?: string | null
                    files?: Json | null
                    author_id: string
                    is_official?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    description?: string | null
                    content?: string | null
                    files?: Json | null
                    author_id?: string
                    is_official?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            workflows: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    description: string | null
                    content: string | null
                    files: Json | null
                    steps: Json | null
                    author_id: string
                    is_official: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    description?: string | null
                    content?: string | null
                    files?: Json | null
                    steps?: Json | null
                    author_id: string
                    is_official?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    description?: string | null
                    content?: string | null
                    files?: Json | null
                    steps?: Json | null
                    author_id?: string
                    is_official?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
