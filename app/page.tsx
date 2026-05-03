"use client";

import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import HomeClient from "./HomeClient";
import Footer from "@/components/ui/footer";
import { useCallback, useEffect, useState } from "react";

// export const revalidate = 600; // cache for 10 minutes

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [mlAccounts, setMlAccounts] = useState<any[]>([]);
  const [pubgAccounts, setPubgAccounts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  //   const [{ data: ads }, { data: ml }, { data: pubg }] = await Promise.all([
  //     supabase
  //       .from("ads")
  //        .select("id, image_url, title, order_index")
  //       .eq("is_active", true)
  //       .order("order_index"),

  //     supabase
  //       .from("accounts")
  //      .select(`
  //           id,
  //           title,
  //           price,
  //           category,
  //           collector_level,
  //           is_sold,
  //           cover_image
  //         `)
  //       .eq("category", "mobile_legend")
  //       .order("created_at", { ascending: false })
  //       .limit(5),

  //     supabase
  //       .from("accounts")
  // .select(`
  //           id,
  //           title,
  //           price,
  //           category,
  //           is_sold,
  //           cover_image
  //         `)
  //       .eq("category", "pubg")
  //       .order("created_at", { ascending: false })
  //       .limit(5),
  //   ]);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both ads and accounts in parallel
      const [adsResponse, mlResponse, pubgResponse] = await Promise.all([
        // fetch(`http://localhost:8000/api/ads`),
        // fetch(`http://localhost:8000/api/accounts`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`),
        // fetch(
        //   `http://localhost:8000/api/accounts?category=mobile_legend&limit=10&order=created_at.desc`,
        // ),
        // fetch(
        //   `http://localhost:8000/api/accounts?category=pubg&limit=10&order=created_at.desc`,
        // ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts?category=mobile_legend&limit=10&order=created_at.desc`,
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts?category=pubg&limit=10&order=created_at.desc`,
        ),
      ]);

      if (!adsResponse.ok || !mlResponse.ok) {
        throw new Error("Failed to fetch home data");
      }

      // console.log(adsResponse)

      const adsPayload = await adsResponse.json();
      const accountsPayload = await mlResponse.json();
      const pubgAccountsPayload = await pubgResponse.json();
      console.log(adsPayload);

      setAds(adsPayload.data || []);
      setMlAccounts(accountsPayload.data || []);
      setPubgAccounts(pubgAccountsPayload.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // console.log(mlAccounts)
  // console.log(ads)

  return (
    <>
      {/* <div className="flex items-center justify-center h-screen text-2xl font-bold">
      website under maintainance, please check back later
    </div> */}
      <Navbar />
      <HomeClient
        ads={ads ?? []}
        mlAccounts={mlAccounts ?? []}
        pubgAccounts={pubgAccounts ?? []}
      />
      <Footer />
    </>
  );
}
