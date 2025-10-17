// app/offers/[id]/page.tsx

("use client");

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, CONTACT_LINKS } from "@/lib/constants";
import { MessageCircle, Phone, ArrowLeft, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface Account {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  collector_level?: string;
  is_sold?: boolean;
  images: string[];
}

export default function OfferDetailPage() {
  const params = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!params.id) {
      setError("No ID provided");
      setLoading(false);
      return;
    }
    fetchAccount(params.id as string);
  }, [params.id]);

  const fetchAccount = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Account not found");
        } else {
          setError("Error loading account");
        }
        return;
      }

      if (!data) {
        setError("Account not found");
        return;
      }

      setAccount(data);
    } catch (err) {
      setError("Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (params.id) {
      fetchAccount(params.id as string);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading account details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-destructive">
              Account Not Found
            </h1>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button asChild variant="outline">
                <Link href="/offers">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Offers
                </Link>
              </Button>
            </div>
          </div>
        </main>
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
          <div>
            <ImageCarousel images={account.images} title={account.title} />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline">
                  {CATEGORIES[account.category as keyof typeof CATEGORIES] ||
                    account.category}
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
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {account.description}
                </p>
              </CardContent>
            </Card>

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
