"use client";
import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import MLClient from "@/components/mobile-legend/MLClient";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Loading from "@/components/loading/Loading";




interface PageProps {
  searchParams: {
    page?: string;
  };
}

export default  function MobileLegendPage() {
 
    const [accounts, setAccounts] = useState<any[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
 useEffect(() => {
  const fetchAccounts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts?category=mobile_legend&page=${pageNumber}&pageSize=${pageSize}`
      );
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const payload = await response.json();
      
      setAccounts(payload.data || []);
      
      // Read pagination info correctly
      if (payload.pagination) {
        setTotal(payload.pagination.total ?? 0);
      } else {
        setTotal(payload.data?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  scrollTo(0, 0); // Scroll to top on page change
  fetchAccounts(page);
}, [page, pageSize]);
  useEffect(() => {
    if (selectedLevel === "all") {
      setFilteredAccounts(accounts);
    } else {
      setFilteredAccounts(
        accounts.filter((account) => account.collector_level === selectedLevel)
      );
    }
  }, [accounts, selectedLevel]);

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-background">
  //       <Navbar />
  //       <div className="text-center py-12">Failed to load accounts</div>
  //       <Footer />
  //     </div>
  //   );
  // }

    if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <MLClient
          accounts={filteredAccounts ?? []}
          total={total ?? 0}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
        />
      </main>
      <Footer />
    </div>
  );
}
