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
import Link from "next/link";
import MLBB from "../components/image/mlbbImage.webp";
import PUBG from "../components/image/pubgImage.jpeg";

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
        .limit(5);

      // Fetch PUBG accounts (latest 10)
      const { data: pubgData } = await supabase
        .from("accounts")
        .select("*")
        .eq("category", "pubg")
        .order("created_at", { ascending: false })
        .limit(5);

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

          {/* Mingalar par Text */}
          <div className="text-center my-12">
            <div className="relative inline-block">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("hero.title")}
              </h2>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
            </div>
          </div>
          {/* Category Cards */}
          <section className="my-12 mx-6 relative border-2 border-primary/20 rounded-xl p-1 pb-5 bg-gradient-to-br from-background to-muted/50 shadow-sm">
            {/* SHOP Text */}
            <div className="">
              <span className=" text-2xl ml-2 font-bold text-primary ">SHOP</span>
            </div>

            {/* Rest of the content remains the same */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-7 px-4">
              {/* Mobile Legend */}
              <Link
                href="/mobile-legend"
                className="group relative flex flex-col items-center justify-center rounded-md shadow-xl p-0 w-72 h-48 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden border border-white/10"
              >
                <Image
                  // src="https://downloadr2.apkmirror.com/wp-content/uploads/2025/09/22/68ca5b05a7169_com.mobile.legends.png"
                  // src="https://cdn.prod.website-files.com/65956e2711516206d2d1258f/67c597753236d97f8a97978d_cover.webp"
                  src={MLBB}
                  alt="Mobile Legend"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Blur overlay for text */}
                <div className="absolute bottom-3 flex items-center justify-center">
                  <div className="backdrop-blur-md bg-black/40 rounded-md px-2 py-1 mx-3 text-center ">
                    <span className="text-white/90 text-sm">
                      {t("hero.explore_mlbb_accounts")}
                    </span>
                  </div>
                </div>
              </Link>

              {/* PUBG */}
              <Link
                href="/pubg"
                className="group relative flex flex-col items-center justify-center rounded-md shadow-xl p-0 w-72 h-48 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden border border-white/10"
              >
                <Image
                  // src="https://downloadr2.apkmirror.com/wp-content/uploads/2025/09/03/68b8f42815eab_com.pubg.krmobile.png"
                  // src="https://www.vice.com/wp-content/uploads/sites/2/2018/12/1545803974526-40176727491_31da2b03d8_b.jpeg"
                  src={PUBG}
                  alt="PUBG"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 flex items-center justify-center">
                  <div className="backdrop-blur-md bg-black/40 rounded-md px-2 py-1 mx-3 text-center ">
                    <span className="text-white/90 text-sm">
                      {t("hero.explore_pubg_accounts")}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
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
