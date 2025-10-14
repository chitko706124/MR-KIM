"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Save, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [adForm, setAdForm] = useState({
    id: "",
    title: "",
    image_url: "",
    link: "",
    order_index: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = (data as any)?.session;
      if (!session) return router.replace("/admin/login");
      fetchData();
    };
    check();
  }, [router]);

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from("ads")
        .select("*")
        .order("order_index");
      setAds(data || []);
    } catch (err) {
      console.error("Error fetching ads", err);
    }
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const adData = {
        title: adForm.title,
        image_url: adForm.image_url,
        link: adForm.link || null,
        order_index: parseInt(adForm.order_index),
        is_active: true,
      };
      if (adForm.id) {
        const { error } = await supabase
          .from("ads")
          .update(adData)
          .eq("id", adForm.id);
        if (error) throw error;
        toast.success("Ad updated");
      } else {
        const { error } = await supabase.from("ads").insert(adData);
        if (error) throw error;
        toast.success("Ad created");
      }
      setAdForm({
        id: "",
        title: "",
        image_url: "",
        link: "",
        order_index: "",
      });
      fetchData();
    } catch (err) {
      console.error("Error saving ad", err);
      toast.error("Error saving ad");
    } finally {
      setLoading(false);
    }
  };

  const editAd = (ad: any) =>
    setAdForm({
      id: ad.id,
      title: ad.title || "",
      image_url: ad.image_url,
      link: ad.link || "",
      order_index: ad.order_index.toString(),
    });
  const deleteAd = async (id: string) => {
    try {
      const { error } = await supabase.from("ads").delete().eq("id", id);
      if (error) throw error;
      toast.success("Ad deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting ad");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin — Ads</h1>

        <Card>
          <CardHeader>
            <CardTitle>{adForm.id ? "Edit Ad" : "Create New Ad"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad-title">Title (Optional)</Label>
                  <Input
                    id="ad-title"
                    value={adForm.title}
                    onChange={(e) =>
                      setAdForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="order">Order Index</Label>
                  <Input
                    id="order"
                    type="number"
                    value={adForm.order_index}
                    onChange={(e) =>
                      setAdForm((prev) => ({
                        ...prev,
                        order_index: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={adForm.image_url}
                  onChange={(e) =>
                    setAdForm((prev) => ({
                      ...prev,
                      image_url: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  value={adForm.link}
                  onChange={(e) =>
                    setAdForm((prev) => ({ ...prev, link: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {adForm.id ? "Update" : "Create"}
                </Button>
                {adForm.id && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setAdForm({
                        id: "",
                        title: "",
                        image_url: "",
                        link: "",
                        order_index: "",
                      })
                    }
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ads List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">
                      {ad.title || "Untitled Ad"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Order: {ad.order_index}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editAd(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
