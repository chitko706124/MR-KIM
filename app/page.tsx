import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import HomeClient from "./HomeClient";
import Footer from "@/components/ui/footer";

export const revalidate = 600; // cache for 10 minutes

export default async function HomePage() {
  const [{ data: ads }, { data: ml }, { data: pubg }] = await Promise.all([
    supabase
      .from("ads")
       .select("id, image_url, title, order_index")
      .eq("is_active", true)
      .order("order_index"),

    supabase
      .from("accounts")
     .select(`
          id,
          title,
          price,
          category,
          collector_level,
          is_sold,
          cover_image
        `)
      .eq("category", "mobile_legend")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("accounts")
.select(`
          id,
          title,
          price,
          category,
          is_sold,
          cover_image
        `)
      .eq("category", "pubg")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <>
    <div className="flex items-center justify-center h-screen text-2xl font-bold">
      website under maintainance, please check back later
    </div>
      {/* <Navbar />
      <HomeClient
        ads={ads ?? []}
        mlAccounts={ml ?? []}
        pubgAccounts={pubg ?? []}
      />
      <Footer /> */}
    </>
  );
}
