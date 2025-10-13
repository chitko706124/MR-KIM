import { supabase } from '@/lib/supabase'

export async function generateStaticParams() {
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('id')

    if (error) {
      console.error('Error fetching accounts for static params:', error)
      return []
    }

    return accounts.map((account) => ({
      id: account.id,
    }))
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}

export default function OfferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}