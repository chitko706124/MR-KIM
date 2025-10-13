import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient("https://bmevmgehowptueyqzogv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZXZtZ2Vob3dwdHVleXF6b2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjU4NzEsImV4cCI6MjA3NTc0MTg3MX0.JQ_UsOQIRMkX6xKX8xGl8ifLc_SKUjiw8Ew3AD7FZZo")

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          discount?: number
          category: 'mobile_legend' | 'pubg'
          collector_level?: string
          images: string[]
          is_sold: boolean
          sold_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          discount?: number
          category: 'mobile_legend' | 'pubg'
          collector_level?: string
          images: string[]
          is_sold?: boolean
          sold_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          discount?: number
          category?: 'mobile_legend' | 'pubg'
          collector_level?: string
          images?: string[]
          is_sold?: boolean
          sold_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      ads: {
        Row: {
          id: string
          image_url: string
          title?: string
          link?: string
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          title?: string
          link?: string
          order_index: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          title?: string
          link?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          created_at?: string
        }
      }
    }
  }
}