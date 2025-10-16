// app/offers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!params.id) {
      setError("No ID provided in URL");
      setLoading(false);
      return;
    }

    console.log("🔄 Component mounted with ID:", params.id);
    fetchAccountWithRetry(params.id as string);
  }, [params.id]);

  const fetchAccountWithRetry = async (id: string, attempt = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Attempt ${attempt} to fetch account:`, id);

      // Add cache busting for Vercel
      const cacheBuster = Date.now();
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);

        // Special handling for Supabase replication delay
        if (error.code === "PGRST116" && attempt < 5) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff
          console.log(
            `⏳ Account not found yet, retrying in ${delay}ms (common with new accounts)...`
          );

          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchAccountWithRetry(id, attempt + 1);
          }, delay);
          return;
        }

        if (error.code === "PGRST116") {
          setError(
            "Account not found. It may have been deleted or is still syncing with the database."
          );
        } else {
          setError(`Database error: ${error.message}`);
        }
        return;
      }

      if (!data) {
        console.log("❌ No data returned");
        setError("Account not found in database");
        return;
      }

      console.log("✅ Account loaded successfully:", data.title);
      setAccount(data);
    } catch (error) {
      console.error("💥 Unexpected error:", error);
      setError(
        "Failed to load account. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (params.id) {
      setRetryCount(0);
      setError(null);
      setLoading(true);
      fetchAccountWithRetry(params.id as string);
    }
  };

  const handleRefresh = () => {
    router.refresh(); // Force Next.js to refresh the page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>
                {retryCount > 0
                  ? "Waiting for account to sync..."
                  : "Loading account details..."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ID: {params.id}
                {retryCount > 0 && ` • Sync attempt ${retryCount}`}
              </p>
              {retryCount > 2 && (
                <p className="text-xs text-amber-600 mt-2 max-w-sm">
                  New accounts can take 1-2 minutes to appear due to database
                  synchronization.
                </p>
              )}
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
              Account Not Available
            </h1>
            <p className="text-muted-foreground">{error}</p>

            <div className="bg-muted p-4 rounded-lg text-sm text-left">
              <p className="font-semibold mb-2">For newly created accounts:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Wait 1-2 minutes for database synchronization</li>
                <li>Try refreshing the page</li>
                <li>Check if the account appears in the main listings</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={handleRefresh} variant="outline">
                Refresh Page
              </Button>
              <Button asChild variant="outline">
                <Link href="/offers">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All Accounts
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
          {/* Image Gallery */}
          <div>
            <ImageCarousel images={account.images} title={account.title} />
          </div>

          {/* Account Details */}
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
