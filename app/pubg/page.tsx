'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AccountCard } from '@/components/ui/account-card'
import { supabase } from '@/lib/supabase'

export default function PubgPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('category', 'pubg')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            PUBG Accounts
          </h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              id={account.id}
              title={account.title}
              price={account.price}
              discount={account.discount}
              images={account.images}
              category={account.category}
              collectorLevel={account.collector_level}
              isSold={account.is_sold}
            />
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No PUBG accounts available at the moment</p>
          </div>
        )}
      </main>
    </div>
  )
}