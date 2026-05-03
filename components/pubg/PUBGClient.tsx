"use client";

import { useMemo, useState } from "react";
import { AccountCard } from "@/components/ui/account-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLLECTOR_LEVELS } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  collector_level?: string;
  is_sold: boolean;
}

interface Props {
  accounts: Account[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (page: any) => void;
}

export default function PUBGClient({
  accounts,
  total,
  page,
  pageSize,
  setPage,
}: Props) {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const router = useRouter();

  const filteredAccounts = useMemo(() => {
    if (selectedLevel === "all") return accounts;
    return accounts.filter(
      (a) => a.collector_level === selectedLevel
    );
  }, [accounts, selectedLevel]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          PUBG Accounts
        </h1>

        {/* <div className="w-full sm:w-64">
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
        </div> */}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAccounts.map((account) => (
          <AccountCard
            key={account.id}
            id={account.id}
            title={account.title}
            price={account.price}
            images={account.images}
            category={account.category}
            collectorLevel={account.collector_level}
            isSold={account.is_sold}
          />
        ))}
      </div>

      {/* Empty */}
      {filteredAccounts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No accounts found
        </div>
      )}

      {/* Pagination */}
      {/* <div className="flex justify-center gap-2 mt-8">
        <button
          disabled={page === 1}
          className="px-3 py-1 border rounded"
          onClick={() => router.push(`?page=${page - 1}`)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => router.push(`?page=${p}`)}
              className={`px-3 py-1 border rounded ${
                p === page ? "bg-primary text-white" : ""
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          disabled={page >= totalPages}
          className="px-3 py-1 border rounded"
          onClick={() => router.push(`?page=${page + 1}`)}
        >
          Next
        </button>
      </div> */}
        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage((p: any) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p: any) => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            Next
          </button>
        </div>
    </>
  );
}
