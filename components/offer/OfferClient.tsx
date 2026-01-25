"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { BackButton } from "@/components/ui/BackButton";
import { MessageCircle, Phone } from "lucide-react";
import { CATEGORIES, CONTACT_LINKS } from "@/lib/constants";
import { useLanguage } from "@/lib/language";

interface Account {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  collector_level?: string;
  is_sold?: boolean;
  images: string[];
}

export default function OfferClient({ account }: { account: Account }) {
  const { t } = useLanguage();

  const categoryName =
    CATEGORIES[account.category as keyof typeof CATEGORIES] ||
    account.category;

  const telegramUrl = `https://t.me/KIM_2Thousand7?text=${encodeURIComponent(
    account.title
  )}%20ဒီအကောင့်လေး%20ဝယ်ချင်လို့ပါ။!`;

  return (
    <>
      <div className="fixed top-20 right-5 z-50">
        <BackButton>Back</BackButton>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <ImageCarousel images={account.images} title={account.title} />

        {/* Details */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{categoryName}</Badge>
            {account.collector_level && (
              <Badge variant="secondary">{account.collector_level}</Badge>
            )}
            {account.is_sold && (
              <Badge variant="destructive">{t("offer.sold")}</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold">{account.title}</h1>

          <span className="text-3xl font-bold text-primary">
            {account.price.toLocaleString()} MMK
          </span>

          <Card>
            <CardHeader>
              <CardTitle>{t("offer.description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {account.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("contact.seller")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <a href={telegramUrl} target="_blank">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t("contact.telegram")}
                </a>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <a href={CONTACT_LINKS.viber} target="_blank">
                  <Phone className="mr-2 h-5 w-5" />
                  {t("contact.viber")}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
