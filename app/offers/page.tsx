"use client";


import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import OfferClient from "@/components/offer/OfferClient";
import { supabase } from "@/lib/supabase";
import { Suspense, useCallback,  useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Loading from "@/components/loading/Loading";

interface Account {
  id: string;
  title: string;
  description: string;
  price: number;
  collector_level?: string;
  is_sold?: boolean;
  category: string;
  images: string[];
}


function OfferDetailPage() {
 const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const offerId = searchParams.get('id');

  const fetchAccount = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${id}`);
      // console.log([response])
      if (response.status === 404) {
        setError("Account not found");
        return;
      }
      if (!response.ok) {
        setError("Error loading account");
        return;
      }
      const payload = await response.json();
      setAccount(payload.data);
    } catch (err) {
      setError("Failed to load account");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!offerId) {
      setError("No account ID provided");
      setLoading(false);
      return;
    }
    fetchAccount(offerId);
  }, [offerId, fetchAccount]);

  const handleRetry = useCallback(() => {
    offerId && fetchAccount(offerId);
  }, [offerId, fetchAccount]);

  // if (error || !data) {
  //   return (
  //     <div className="min-h-screen bg-background">
  //       <Navbar />
  //       <main className="container mx-auto px-4 py-12 text-center">
  //         <h1 className="text-2xl font-bold text-destructive">
  //           Account not found
  //         </h1>
  //       </main>
  //       <Footer />
  //     </div>
  //   );
  // }

  if(loading) {
    return (
      <div className="min-h-screen bg-background">  
        <Navbar />
        <Loading />
      </div>
    );
  }
  if (error || !account) {
    return (
      <div className="text-center space-y-4 max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold text-destructive">
          Account Not Found
        </h1>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => window.history.back()} variant="outline">
            Back to Offers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <OfferClient account={account} />
      </main>
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function OfferDetail() {
  return (
    <Suspense fallback={<Loading />}>
      <OfferDetailPage />
    </Suspense>
  );
}
