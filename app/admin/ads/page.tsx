"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Edit, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [adForm, setAdForm] = useState({
    id: "",
    title: "",
    link: "",
    order_index: "0",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const checkAuth = async () => {
      if (!localStorage.getItem('auth_token')) {
        router.replace("/admin/login");
      }
    };
    checkAuth();
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/ads`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch ads");
      
      const data = await response.json();
      
      if (data.status === "success") {
        setAds(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch ads");
      }
    } catch (err: any) {
      console.error("Error fetching ads", err);
      toast.error(err.message || "Error fetching ads");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!selectedFile && !adForm.id) {
        toast.error("Please select an image");
        return;
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const formData = new FormData();
      
      // Append text fields
      if (adForm.title) formData.append('title', adForm.title);
      if (adForm.link) formData.append('link', adForm.link);
      formData.append('order_index', adForm.order_index || '0');
      
      // Append image file if selected
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      let url = `${API_URL}/ads`;
      let method = "POST";

      if (adForm.id) {
        // Update existing ad
        url = `${API_URL}/ads/${adForm.id}`;
        method = "PUT";
        
        // For updates, we need to send _method=PUT if using Laravel's method spoofing
        // Or use PATCH depending on your backend
        // Since your route uses PUT, we'll use PUT
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok || data.status !== "success") {
        const errorMsg = data.errors 
          ? Object.values(data.errors).flat().join(', ')
          : data.message || `Failed to ${adForm.id ? 'update' : 'create'} ad`;
        throw new Error(errorMsg);
      }

      toast.success(data.message || `Ad ${adForm.id ? 'updated' : 'created'} successfully`);
      
      // Reset form
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error("Error saving ad", err);
      toast.error(err.message || "Error saving ad");
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedFile = () => {
    if (selectedFile && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview("");
  };

  const editAd = (ad: any) => {
    setAdForm({
      id: ad.id,
      title: ad.title || "",
      link: ad.link || "",
      order_index: ad.order_index?.toString() || "0",
    });
    setImagePreview(ad.image_url);
    setSelectedFile(null); // Clear any selected file when editing
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/ads/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to delete ad");
      }

      toast.success(data.message || "Ad deleted successfully");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting ad:", err);
      toast.error(err.message || "Error deleting ad");
    }
  };

  const resetForm = () => {
    setAdForm({
      id: "",
      title: "",
      link: "",
      order_index: "0",
    });
    
    // Clean up object URL if it exists
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setSelectedFile(null);
    setImagePreview("");
  };

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
                    placeholder="Enter ad title"
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
                    placeholder="Display order"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={adForm.link}
                  onChange={(e) =>
                    setAdForm((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="https://example.com"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <Label htmlFor="image-upload">
                  Ad Image {!adForm.id ? "*" : ""}
                </Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <div className="w-48 h-32 relative border rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized={imagePreview.startsWith('blob:')}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={removeSelectedFile}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        Click to upload image
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploading}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                      {!adForm.id && (
                        <p className="text-xs text-red-500 mt-1">
                          * Required for new ads
                        </p>
                      )}
                      {uploading && (
                        <p className="text-xs text-blue-500 mt-1">
                          Uploading...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex items-center gap-2"
                >
                  {loading || uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {adForm.id ? "Update" : "Create"}
                </Button>
                {(adForm.id || selectedFile) && (
                  <Button type="button" variant="outline" onClick={resetForm}>
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
            <p className="text-sm text-muted-foreground">
              Total ads: {ads.length}
            </p>
          </CardHeader>
          <CardContent>
            {ads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No ads found. Create your first ad above.
              </p>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={ad.image_url}
                          alt={ad.title || "Ad image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {ad.title || "Untitled Ad"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Order: {ad.order_index} • 
                          {ad.link ? (
                            <a 
                              href={ad.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline ml-1"
                            >
                              Has link
                            </a>
                          ) : (
                            " No link"
                          )}
                          {!ad.is_active && (
                            <span className="ml-2 text-amber-500">
                              • Inactive
                            </span>
                          )}
                        </p>
                      </div>
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}