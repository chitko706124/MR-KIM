"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { COLLECTOR_LEVELS, CATEGORIES } from "@/lib/constants";
import { CreditCard as Edit, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [accountForm, setAccountForm] = useState({
    id: "",
    title: "",
    description: "",
    price: "",
    discount: "",
    category: "",
    collector_level: "",
    images: [] as string[],
  });

  const [isEditing, setIsEditing] = useState(false);

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
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accountData = {
        title: accountForm.title,
        description: accountForm.description,
        price: parseFloat(accountForm.price),
        discount: accountForm.discount
          ? parseFloat(accountForm.discount)
          : null,
        category: accountForm.category,
        collector_level: accountForm.collector_level || null,
        images: accountForm.images,
      };

      if (isEditing && accountForm.id) {
        const { error } = await supabase
          .from("accounts")
          .update(accountData)
          .eq("id", accountForm.id);
        if (error) throw error;
        toast.success("Account updated successfully");
      } else {
        const { error } = await supabase.from("accounts").insert(accountData);
        if (error) throw error;
        toast.success("Account created successfully");
      }

      resetAccountForm();
      fetchData();
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error("Error saving account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({ is_sold: true, sold_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Account marked as sold");
      fetchData();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error marking account as sold");
    }
  };

  const editAccount = (account: any) => {
    setAccountForm({
      id: account.id,
      title: account.title,
      description: account.description,
      price: account.price.toString(),
      discount: account.discount?.toString() || "",
      category: account.category,
      collector_level: account.collector_level || "",
      images: account.images,
    });
    setIsEditing(true);
  };

  const resetAccountForm = () => {
    setAccountForm({
      id: "",
      title: "",
      description: "",
      price: "",
      discount: "",
      category: "",
      collector_level: "",
      images: [],
    });
    setIsEditing(false);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // simple approach: use first file
    const file = files[0];
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("accounts-images")
        .upload(fileName, file);
      if (uploadError) {
        console.error("Upload error", uploadError);
        toast.error("Image upload failed");
        return;
      }
      const { data } = supabase.storage
        .from("accounts-images")
        .getPublicUrl(fileName);
      const url = data.publicUrl;
      if (typeof index === "number") {
        const newImages = [...accountForm.images];
        newImages[index] = url;
        setAccountForm((prev) => ({ ...prev, images: newImages }));
      } else {
        setAccountForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      }
    } catch (err) {
      console.error("Storage error", err);
      toast.error("Image upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin — Accounts</h1>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Account" : "Create New Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={accountForm.title}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={accountForm.category}
                    onValueChange={(v) =>
                      setAccountForm((prev) => ({ ...prev, category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_legend">
                        Mobile Legend
                      </SelectItem>
                      <SelectItem value="pubg">PUBG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={accountForm.description}
                  onChange={(e) =>
                    setAccountForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={accountForm.price}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    max="100"
                    value={accountForm.discount}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        discount: e.target.value,
                      }))
                    }
                  />
                </div>
                {accountForm.category === "mobile_legend" && (
                  <div>
                    <Label htmlFor="collector_level">Collector Level</Label>
                    <Select
                      value={accountForm.collector_level}
                      onValueChange={(v) =>
                        setAccountForm((prev) => ({
                          ...prev,
                          collector_level: v,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLLECTOR_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label>Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {accountForm.images.map((img, idx) => (
                    <Badge key={idx} variant="outline">
                      Image {idx + 1}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update" : "Create"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAccountForm}
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
            <CardTitle>Accounts List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{account.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {CATEGORIES[account.category as keyof typeof CATEGORIES]}{" "}
                      • ${account.price}
                      {account.discount && ` (-${account.discount}%)`}
                    </p>
                    {account.is_sold && (
                      <Badge variant="destructive" className="mt-1">
                        Sold Out
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editAccount(account)}
                      disabled={account.is_sold}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={account.is_sold}
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
