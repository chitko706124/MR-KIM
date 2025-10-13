'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AccountCard } from '@/components/ui/account-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { COLLECTOR_LEVELS } from '@/lib/constants'

export default function MobileLegendPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    filterAccounts()
  }, [accounts, selectedLevel])

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('category', 'mobile_legend')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAccounts = () => {
    if (selectedLevel === 'all') {
      setFilteredAccounts(accounts)
    } else {
      setFilteredAccounts(accounts.filter(account => account.collector_level === selectedLevel))
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mobile Legend Accounts
          </h1>
          
          <div className="w-full sm:w-64">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by Collector Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {COLLECTOR_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccounts.map((account) => (
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

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedLevel === 'all' ? 'No accounts available' : `No accounts found for ${selectedLevel}`}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}