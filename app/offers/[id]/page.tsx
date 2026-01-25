import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import OfferClient from "@/components/offer/OfferClient";
import { supabase } from "@/lib/supabase";


interface PageProps {
  params: { id: string };
}

export default async function OfferDetailPage({ params }: PageProps) {
  const { id } = params;

  const { data, error } = await supabase
    .from("accounts")
    .select(`
      id,
      title,
      description,
      price,
      category,
      collector_level,
      is_sold,
      images
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Account not found
          </h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <OfferClient account={data} />
      </main>
      <Footer />
    </div>
  );
}
