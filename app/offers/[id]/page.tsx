// app/offers/[id]/page.tsx
"use client";

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
import { MessageCircle, Phone, ArrowLeft } from "lucide-react";
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
// app/offers/[id]/page.tsx
export const dynamic = 'force-dynamic'; // Disable caching
export const revalidate = 0; // Disable revalidation

export default function OfferDetailPage() {
  const params = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!params.id) {
      setError("No ID provided in URL");
      setLoading(false);
      return;
    }

    console.log("🔄 Component mounted with ID:", params.id);
    fetchAccount(params.id as string);
  }, [params.id]);

  const fetchAccount = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Fetching account with ID:", id);

      const { data, error, status, count } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      console.log("📦 Full Supabase response:", { 
        data, 
        error, 
        status,
        count 
      });

      if (error) {
        console.error("❌ Supabase error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === 'PGRST116') {
          setError(`Account with ID "${id}" not found in database`);
        } else {
          setError(`Database error: ${error.message}`);
        }
        return;
      }

      if (!data) {
        console.log("❌ No data returned for ID:", id);
        setError("Account data is null");
        return;
      }

      // Check for required fields
      const missingFields = [];
      if (!data.title) missingFields.push('title');
      if (!data.description) missingFields.push('description');
      if (!data.price) missingFields.push('price');
      if (!data.category) missingFields.push('category');

      if (missingFields.length > 0) {
        console.warn("⚠️ Account missing required fields:", missingFields);
      }

      console.log("✅ Account successfully loaded:", {
        id: data.id,
        title: data.title,
        hasImages: data.images?.length > 0,
        isSold: data.is_sold
      });

      setAccount(data);
      
    } catch (error) {
      console.error("💥 Unexpected error:", error);
      setError("An unexpected error occurred while loading the account");
    } finally {
      setLoading(false);
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
              <p className="text-sm text-muted-foreground mt-2">
                ID: {params.id}
              </p>
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
              {error || "Account Not Found"}
            </h1>
            <p className="text-muted-foreground">
              We couldn't find the account you're looking for.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left">
              <p className="text-sm">
                <strong>Debug Info:</strong><br />
                ID: {params.id}<br />
                Type: {typeof params.id}<br />
                Error: {error}
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/offers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Offers
              </Link>
            </Button>
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
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 border border-yellow-400 p-3 rounded mb-4 text-sm">
            <strong>Debug:</strong> Loaded account "{account.title}" (ID: {account.id})
          </div>
        )}
        
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
                  {CATEGORIES[account.category as keyof typeof CATEGORIES] || account.category}
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
