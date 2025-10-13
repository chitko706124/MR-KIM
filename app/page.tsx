'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/ui/navbar'
import { AccountCard } from '@/components/ui/account-card'
import { CarouselSection } from '@/components/ui/carousel-section'
import { supabase } from '@/lib/supabase'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([])
  const [mlAccounts, setMlAccounts] = useState<any[]>([])
  const [pubgAccounts, setPubgAccounts] = useState<any[]>([])
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch ads
      const { data: adsData } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('order_index')

      // Fetch Mobile Legend accounts (latest 10)
      const { data: mlData } = await supabase
        .from('accounts')
        .select('*')
        .eq('category', 'mobile_legend')
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch PUBG accounts (latest 10)
      const { data: pubgData } = await supabase
        .from('accounts')
        .select('*')
        .eq('category', 'pubg')
        .order('created_at', { ascending: false })
        .limit(10)

      setAds(adsData || [])
      setMlAccounts(mlData || [])
      setPubgAccounts(pubgData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Ads Carousel */}
        <section className="relative">
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex">
              {ads.length > 0 ? (
                ads.map((ad) => (
                  <div key={ad.id} className="embla__slide relative w-full aspect-[16/9] sm:aspect-[21/9]">
                    <Image
                      src={ad.image_url}
                      alt={ad.title || 'Advertisement'}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ))
              ) : (
                <div className="embla__slide relative w-full aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Welcome to GameHub</h2>
                    <p className="text-xl">Premium Game Accounts Available Now</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {ads.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
                onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </section>

        {/* New Arrivals - Mobile Legend */}
        {mlAccounts.length > 0 && (
          <CarouselSection title="New Arrival Mobile Legend Accounts">
            {mlAccounts.map((account) => (
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
          </CarouselSection>
        )}

        {/* New Arrivals - PUBG */}
        {pubgAccounts.length > 0 && (
          <CarouselSection title="New Arrival PUBG Accounts">
            {pubgAccounts.map((account) => (
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
          </CarouselSection>
        )}
      </main>
    </div>
  )
}