import { Navbar } from "@/components/ui/navbar";
import SearchResults from "@/components/search/search-results";
import { supabase } from "@/lib/supabase";

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q;

  if (!query) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Search</h1>
          <p>Please enter a search term.</p>
        </main>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("accounts")
    .select(`
      id,
      title,
      price,
      description,
      category,
      collector_level,
      is_sold,
      cover_image
    `)
    .ilike("title", `%${query}%`)
    .eq("is_sold", false)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error(error);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <SearchResults results={data ?? []} query={query} />
      </main>
    </div>
  );
}
