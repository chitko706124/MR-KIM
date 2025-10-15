"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { CONTACT_LINKS, CATEGORIES } from "@/lib/constants";
import { MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function OfferDetailPage() {
  const params = useParams();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (params.id) {
      fetchAccount(params.id as string);
    }
  }, [params.id]);

  const fetchAccount = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setAccount(data);
    } catch (error) {
      console.error("Error fetching account:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Account Not Found</h1>
            <Link href="/">
              <Button>{t("offer.back")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = account.discount
    ? account.price - (account.price * account.discount) / 100
    : account.price;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <ImageCarousel images={account.images} title={account.title} />
          </div>

          {/* Account Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline">
                  {CATEGORIES[account.category as keyof typeof CATEGORIES]}
                </Badge>
                {account.collector_level && (
                  <Badge variant="secondary">{account.collector_level}</Badge>
                )}
                {account.is_sold && (
                  <Badge variant="destructive">{t("offer.sold")}</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{account.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                {account.discount ? (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      {finalPrice.toLocaleString()} MMK
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {account.price.toLocaleString()} MMK
                    </span>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      -{account.discount}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {account.price.toLocaleString()} MMK
                  </span>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("offer.description")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {account.description}
                </p>
              </CardContent>
            </Card>

            {/* Contact Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>{t("contact.seller")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <a
                    href={`tg://resolve?domain=KIM_2Thousand7`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("contact.telegram")}
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <a
                    href={CONTACT_LINKS.viber}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    {t("contact.viber")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
