"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { ArrowLeft, Search } from "lucide-react";

interface Account {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  collector_level?: string;
  cover_image: string;
}

export default function SearchResults({
  results,
  query,
}: {
  results: Account[];
  query: string;
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Search className="h-16 w-16 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-bold">No results found</h2>
        <p>No accounts match &quot;{query}&quot;</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Results for &quot;{query}&quot;</h1>
          <p className="text-muted-foreground">
            Found {results.length} account(s)
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((account) => (
          <Card key={account.id} className="overflow-hidden">
            <Link href={`/offers/${account.id}`}>
              <div className="aspect-video relative">
                <Image
                  src={account.cover_image || "/placeholder-image.jpg"}
                  alt={account.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge>
                    {CATEGORIES[account.category as keyof typeof CATEGORIES]}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2">
                  {account.title}
                </h3>
                <p className="font-bold text-primary mt-2">
                  {account.price.toLocaleString()} MMK
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {account.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
