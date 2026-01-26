"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { CarouselSection } from "@/components/ui/carousel-section";
import { AccountCard } from "@/components/ui/account-card";
import { useLanguage } from "@/lib/language";
import Link from "next/link";
import MLBB from "../components/image/mlbbImage.webp";
import PUBG from "../components/image/pubgImage.jpeg";

export default function HomeClient({ ads, mlAccounts, pubgAccounts }: any) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { t } = useLanguage();

  return (
    <main>
      {/* Ads */}
      {/* <section className="relative">
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {ads.map((ad: any) => (
              <div key={ad.id} className="relative w-full aspect-[16/9]">
                <Image
                  src={ad.image_url}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section> */}
      <section className="relative">
  <div className="embla overflow-hidden" ref={emblaRef}>
    <div className="flex">
      {ads.map((ad: any) => (
        <div key={ad.id} className="relative flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 ">
          {/* Mobile: Full width (100%), Tablet: Half width (50%), Desktop: One-third (33.333%) */}
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={ad.image_url}
              alt={ad.title}
               fill
  unoptimized
  loading="lazy"
              className="object-cover "
            
            />
          </div>
        </div>
      ))}
    </div>
  </div>
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
              <span className=" text-2xl ml-2 font-bold text-primary ">
                SHOP
              </span>
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
  unoptimized
                  className="object-cover"
                  priority
                />
                {/* Blur overlay for text */}
                <div className="absolute bottom-3 flex items-center justify-center">
                  <div className="backdrop-blur-md bg-black/40 rounded-md px-2 py-1 mx-3 text-center ">
                    <span className="text-white/90 text-lg">
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
  unoptimized
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 flex items-center justify-center">
                  <div className="backdrop-blur-md bg-black/40 rounded-md px-2 py-1 mx-3 text-center ">
                    <span className="text-white/90 text-lg">
                      {t("hero.explore_pubg_accounts")}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </section>

      {/* ML */}
      {mlAccounts.length > 0 && (
        <CarouselSection title={t("hero.new_arrival_mlbb")}>
          {mlAccounts.map((a: any) => (
            <AccountCard key={a.id} {...a} />
          ))}
        </CarouselSection>
      )}

      {/* PUBG */}
      {pubgAccounts.length > 0 && (
        <CarouselSection title={t("hero.new_arrival_pubg")}>
          {pubgAccounts.map((a: any) => (
            <AccountCard key={a.id} {...a} />
          ))}
        </CarouselSection>
      )}
    </main>
  );
}
