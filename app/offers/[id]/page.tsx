// app/offers/[id]/page.tsx - SERVER COMPONENT
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { CATEGORIES, CONTACT_LINKS } from "@/lib/constants";
import { MessageCircle, Phone, ArrowLeft } from "lucide-react";

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

export default async function OfferDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch account on the server
  const { data: account, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !account) {
    notFound();
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
                {account.is_sold && <Badge variant="destructive">Sold</Badge>}
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
                <CardTitle>Description</CardTitle>
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
                <CardTitle>Contact Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <a
                    href={`tg://resolve?domain=KIM_2Thousand7`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Telegram
                  </a>
                </Button>

                <Button asChild variant="outline" className="w-full" size="lg">
                  <a
                    href={CONTACT_LINKS.viber}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Viber
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
