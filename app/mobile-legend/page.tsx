import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import MLClient from "@/components/mobile-legend/MLClient";
import { supabase } from "@/lib/supabase";

export const revalidate = 300; // cache for 5 minutes



interface PageProps {
  searchParams: {
    page?: string;
  };
}

export default async function MobileLegendPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const pageSize = 12;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("accounts")
    .select(
      "id, title, price, cover_image, category, collector_level, is_sold",
      { count: "planned" }
    )
    .eq("category", "mobile_legend")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-12">Failed to load accounts</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <MLClient
          accounts={data ?? []}
          total={count ?? 0}
          page={page}
          pageSize={pageSize}
        />
      </main>
      <Footer />
    </div>
  );
}
