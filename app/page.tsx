"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { useLanguage } from "@/lib/language";
import { AccountCard } from "@/components/ui/account-card";
import { CarouselSection } from "@/components/ui/carousel-section";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading/Loading";

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [mlAccounts, setMlAccounts] = useState<any[]>([]);
  const [pubgAccounts, setPubgAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch ads
      const { data: adsData } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      // Fetch Mobile Legend accounts (latest 10)
      const { data: mlData } = await supabase
        .from("accounts")
        .select("*")
        .eq("category", "mobile_legend")
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch PUBG accounts (latest 10)
      const { data: pubgData } = await supabase
        .from("accounts")
        .select("*")
        .eq("category", "pubg")
        .order("created_at", { ascending: false })
        .limit(10);

      setAds(adsData || []);
      setMlAccounts(mlData || []);
      setPubgAccounts(pubgData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {loading ? (
        <Loading />
      ) : (
        <main>
          {/* Ads Carousel */}
          {/* <section className="relative">
            <div className="embla overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex">
                {ads.length > 0 &&
                  ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="embla__slide relative flex-[0_0_100%] sm:flex-[0_0_100%] w-full aspect-[16/9] sm:aspect-[36/9]"
                    >
                      <Image
                        src={ad.image_url}
                        alt={ad.title || "Advertisement"}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  ))}
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
          </section> */}

          <section className="relative">
            <div className="embla overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex">
                {ads.length > 0 &&
                  ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="embla__slide relative flex-[0_0_100%] lg:flex-[0_0_33.333%] w-full aspect-[16/9]"
                    >
                      <Image
                        src={ad.image_url}
                        alt={ad.title || "Advertisement"}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  ))}
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

          {/* Category Cards */}
          <section className="my-12 flex flex-col sm:flex-row gap-4 justify-center items-center px-4 ">
            {/* Mobile Legend */}
            <a
              href="/mobile-legend"
              className="group relative flex flex-col items-center justify-center rounded-md shadow-xl p-0 w-48 h-48 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden border border-white/10"
            >
              <Image
                src="https://downloadr2.apkmirror.com/wp-content/uploads/2025/09/22/68ca5b05a7169_com.mobile.legends.png"
                alt="Mobile Legend"
                fill
                className="object-cover"
                priority
              />
              {/* Blur overlay for text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="backdrop-blur-md bg-black/40 rounded-md px-2 py-1 mx-3 text-center mt-24">
                  <span className="text-white/90 text-sm">
                    {t("hero.explore_mlbb_accounts")}
                  </span>
                </div>
              </div>
            </a>

            {/* PUBG */}
            <a
              href="/pubg"
              className="group relative flex flex-col items-center justify-center rounded-md shadow-xl p-0 w-48 h-48 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden border border-white/10"
            >
              <Image
                src="https://downloadr2.apkmirror.com/wp-content/uploads/2025/09/03/68b8f42815eab_com.pubg.krmobile.png"
                alt="PUBG"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="backdrop-blur-md bg-black/40 rounded-md px-2 py-1 mx-3 text-center mt-24">
                  <span className="text-white/90 text-sm">
                    {t("hero.explore_pubg_accounts")}
                  </span>
                </div>
              </div>
            </a>
          </section>

          {/* New Arrivals - Mobile Legend */}
          {mlAccounts.length > 0 && (
            <CarouselSection title={t("hero.new_arrival_mlbb")}>
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
            <CarouselSection title={t("hero.new_arrival_pubg")}>
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
      )}
    </div>
  );
}
