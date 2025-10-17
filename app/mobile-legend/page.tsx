"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { AccountCard } from "@/components/ui/account-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { COLLECTOR_LEVELS } from "@/lib/constants";

export default function MobileLegendPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    fetchAccounts(page);
  }, [page]);

  useEffect(() => {
    filterAccounts();
  }, [accounts, selectedLevel]);

  const fetchAccounts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const from = (pageNumber - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("accounts")
        .select("*", { count: "exact" })
        .eq("category", "mobile_legend")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setAccounts(data || []);
      setTotal(count ?? 0);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    if (selectedLevel === "all") {
      setFilteredAccounts(accounts);
    } else {
      setFilteredAccounts(
        accounts.filter((account) => account.collector_level === selectedLevel)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mobile Legend Accounts
          </h1>

          <div className="w-full sm:w-64">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by Collector Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {COLLECTOR_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              id={account.id}
              title={account.title}
              price={account.price}
              discount={account.discount}
              images={account.images}
              category={account.category}
              collectorLevel={account.collector_level}
              isSold={account.is_sold}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>

          {/* page numbers */}
          {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }).map(
            (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded border ${
                    pageNum === page
                      ? "bg-primary dark:text-black text-white"
                      : ""
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            }
          )}

          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            Next
          </button>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedLevel === "all"
                ? "No accounts available"
                : `No accounts found for ${selectedLevel}`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
