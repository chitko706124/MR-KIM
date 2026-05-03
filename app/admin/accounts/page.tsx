"use client";

import { useEffect, useState, useCallback } from "react";
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
import { toast } from "sonner";
import Image from "next/image";
import {
  CreditCard as Edit,
  Trash2,
  Save,
  Clock,
  Undo,
  Upload,
  X,
  Loader2,
} from "lucide-react";

// Define types based on backend
interface Account {
  id: string;
  title: string;
  description: string;
  price: number;
  skins: number;
  collector_level: string | null;
  images: string[];
  category: string;
  discount: number | null;
  is_sold: boolean;
  sold_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountFormData {
  id: string;
  title: string;
  description: string;
  price: string;
  skins: string;
  collector_level: string;
  category: string;
  discount: string;
  images: File[]; // Store File objects, not URLs
  existingImages: string[]; // For editing - keep existing image URLs
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Constants {
  collector_levels: string[];
  categories: Record<string, string>;
}

// Image compression configuration
interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0 to 1
  format: "image/webp";
}

const COMPRESSION_CONFIG: CompressionConfig = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: "image/webp",
};

export default function AdminAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressingImages, setCompressingImages] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [constants, setConstants] = useState<Constants>({
    collector_levels: [],
    categories: {},
  });

  const [accountForm, setAccountForm] = useState<AccountFormData>({
    id: "",
    title: "",
    description: "",
    price: "",
    skins: "0",
    collector_level: "",
    category: "",
    discount: "",
    images: [],
    existingImages: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Check auth and fetch constants
  useEffect(() => {
    const initialize = async () => {
      // Check auth
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      // Fetch constants
      try {
        const response = await fetch(`${API_URL}/constants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setConstants(data.data);
        } else {
          // If constants endpoint doesn't exist, use hardcoded values
          setConstants({
            collector_levels: [
              "Discount Accounts",
              "Expert collector",
              "Renowned Collector",
              "Exalted Collector",
              "Mega Collector",
              "World Collector",
              "World Collector +",
            ],
            categories: {
              mobile_legend: "Mobile Legend",

              pubg: "PUBG",
            },
          });
        }
      } catch (error) {
        // console.error("Error fetching constants:", error);
        // Fallback to hardcoded values
        setConstants({
          collector_levels: [
            "Discount Accounts",
            "Expert collector",
            "Renowned Collector",
            "Exalted Collector",
            "Mega Collector",
            "World Collector",
            "World Collector +",
          ],
          categories: {
            mobile_legend: "Mobile Legend",

            pubg: "PUBG",
          },
        });
      }
    };

    initialize();
  }, [router, API_URL]);

  // const fetchData = useCallback(
  //   async (page = 1, category: string | null = null) => {
  //     try {
  //       setLoading(true);
  //       const token = localStorage.getItem("auth_token");
  //       const url = new URL(`${API_URL}/accounts`);
  //       url.searchParams.append("page", page.toString());
  //       url.searchParams.append("pageSize", pagination.pageSize.toString());
  //       if (category) url.searchParams.append("category", category);

  //       const response = await fetch(url.toString(), {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       if (!response.ok) throw new Error("Failed to fetch accounts");

  //       const data = await response.json();

  //       if (data.status === "success") {
  //         setAccounts(data.data || []);
  //         setPagination(
  //           data.pagination || {
  //             page,
  //             pageSize: pagination.pageSize,
  //             total: 0,
  //             totalPages: 1,
  //           },
  //         );
  //       } else {
  //         throw new Error(data.message || "Failed to fetch accounts");
  //       }
  //     } catch (error: any) {
  //       // console.error("Error fetching accounts:", error);
  //       toast.error(error.message || "Error fetching accounts");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [API_URL, pagination.pageSize],
  // );

  // useEffect(() => {
  //   fetchData(pagination.page);
  // }, [pagination.page, fetchData]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Update your fetchData function to handle the category
  const fetchData = useCallback(
    async (page = 1, category: string | null = null) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        const url = new URL(`${API_URL}/accounts`);
        url.searchParams.append("page", page.toString());
        url.searchParams.append("pageSize", pagination.pageSize.toString());
        if (category && category !== "all") {
          url.searchParams.append("category", category);
        }

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch accounts");

        const data = await response.json();

        if (data.status === "success") {
          setAccounts(data.data || []);
          setPagination(
            data.pagination || {
              page,
              pageSize: pagination.pageSize,
              total: 0,
              totalPages: 1,
            },
          );
        } else {
          throw new Error(data.message || "Failed to fetch accounts");
        }
      } catch (error: any) {
        // console.error("Error fetching accounts:", error);
        toast.error(error.message || "Error fetching accounts");
      } finally {
        setLoading(false);
      }
    },
    [API_URL, pagination.pageSize],
  );

  // Add category change handler
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Reset to page 1 when category changes
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Fetch data with new category
    fetchData(1, value === "all" ? null : value);
  };

  // Update useEffect to include category in dependencies
  useEffect(() => {
    fetchData(
      pagination.page,
      selectedCategory === "all" ? null : selectedCategory,
    );
  }, [pagination.page, selectedCategory, fetchData]);

  /**
   * Compress and convert image to WebP format
   */
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > COMPRESSION_CONFIG.maxWidth) {
              height = Math.round(
                (height * COMPRESSION_CONFIG.maxWidth) / width,
              );
              width = COMPRESSION_CONFIG.maxWidth;
            }
          } else {
            if (height > COMPRESSION_CONFIG.maxHeight) {
              width = Math.round(
                (width * COMPRESSION_CONFIG.maxHeight) / height,
              );
              height = COMPRESSION_CONFIG.maxHeight;
            }
          }

          // Create canvas and draw image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Could not compress image"));
                return;
              }

              // Create new file with .webp extension
              const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const compressedFile = new File([blob], fileName, {
                type: "image/webp",
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            COMPRESSION_CONFIG.format,
            COMPRESSION_CONFIG.quality,
          );
        };
        img.onerror = () => {
          reject(new Error("Could not load image"));
        };
      };
      reader.onerror = () => {
        reject(new Error("Could not read file"));
      };
    });
  };

  /**
   * Handle image upload with compression
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressingImages(true);

    try {
      // Validate files
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          invalidFiles.push(`${file.name} is not an image`);
          return;
        }

        // Validate file size (max 20MB for original - will be compressed)
        if (file.size > 20 * 1024 * 1024) {
          invalidFiles.push(`${file.name} is too large (max 20MB)`);
          return;
        }

        validFiles.push(file);
      });

      if (invalidFiles.length > 0) {
        toast.error(`Some files were invalid: ${invalidFiles.join(", ")}`);
      }

      if (validFiles.length > 0) {
        // Compress each valid image
        const compressionPromises = validFiles.map((file) =>
          compressImage(file),
        );
        const compressedImages = await Promise.all(compressionPromises);

        // Add compressed images to the form
        setAccountForm((prev) => ({
          ...prev,
          images: [...prev.images, ...compressedImages],
        }));

        toast.success(
          `Added ${compressedImages.length} images (compressed to WebP)`,
        );
      }
    } catch (error) {
      // console.error("Error compressing images:", error);
      toast.error("Error compressing images");
    } finally {
      setCompressingImages(false);
    }

    e.target.value = "";
  };

  const getTimeRemaining = (deletedAt: string) => {
    const deletedTime = new Date(deletedAt).getTime();
    const now = new Date().getTime();
    const timeDiff = deletedTime + 24 * 60 * 60 * 1000 - now;

    if (timeDiff <= 0) return { hoursRemaining: 0, minutesRemaining: 0 };

    const hoursRemaining = Math.floor(timeDiff / (60 * 60 * 1000));
    const minutesRemaining = Math.floor(
      (timeDiff % (60 * 60 * 1000)) / (60 * 1000),
    );

    return { hoursRemaining, minutesRemaining };
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      // Create FormData object
      const formData = new FormData();

      // Append basic fields
      formData.append("title", accountForm.title);
      formData.append("description", accountForm.description);
      formData.append("price", accountForm.price);
      formData.append("skins", accountForm.skins);
      formData.append("category", accountForm.category);

      if (accountForm.collector_level) {
        formData.append("collector_level", accountForm.collector_level);
      }

      if (accountForm.discount) {
        formData.append("discount", accountForm.discount);
      }

      // For updates, send remaining existing images
      if (isEditing && accountForm.existingImages.length > 0) {
        // Append each existing image URL to the 'images' array
        accountForm.existingImages.forEach((imageUrl, index) => {
          formData.append(`images[${index}]`, imageUrl);
        });
      }

      // Append new image files as 'new_images' (already compressed to WebP)
      accountForm.images.forEach((image, index) => {
        formData.append(`new_images[${index}]`, image);
      });

      let response;
      if (isEditing && accountForm.id) {
        // Update existing account
        response = await fetch(`${API_URL}/accounts/${accountForm.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header for FormData
          },
          body: formData,
        });
      } else {
        // For create, we don't send 'images' field, only 'new_images'
        const createFormData = new FormData();

        // Copy all fields except images (since they'll be sent as new_images)
        formData.forEach((value, key) => {
          if (!key.startsWith("images[")) {
            createFormData.append(key, value);
          }
        });

        // Add new images as 'images' for create (not 'new_images')
        accountForm.images.forEach((image, index) => {
          createFormData.append(`images[${index}]`, image);
        });

        response = await fetch(`${API_URL}/accounts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: createFormData,
        });
      }

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        const errorMsg = data.errors
          ? Object.values(data.errors).flat().join(", ")
          : data.message ||
            `Failed to ${isEditing ? "update" : "create"} account`;
        throw new Error(errorMsg);
      }

      toast.success(
        data.message ||
          `Account ${isEditing ? "updated" : "created"} successfully`,
      );
      resetAccountForm();
      fetchData(pagination.page);
    } catch (error: any) {
      // console.error("Error saving account:", error);
      toast.error(error.message || "Error saving account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to mark this account for deletion? It will show as 'Sold Out' for 24 hours before being permanently deleted.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_URL}/accounts/${id}/mark-for-deletion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to mark account for deletion");
      }

      toast.success(data.message || "Account marked for deletion");
      fetchData(pagination.page);
    } catch (error: any) {
      // console.error("Error deleting account:", error);
      toast.error(error.message || "Error marking account for deletion");
    }
  };

  const restoreAccount = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/accounts/${id}/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to restore account");
      }

      toast.success(data.message || "Account restored successfully");
      fetchData(pagination.page);
    } catch (error: any) {
      // console.error("Error restoring account:", error);
      toast.error(error.message || "Error restoring account");
    }
  };

  const deleteAccountPermanently = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this account permanently? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/accounts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to delete account");
      }

      toast.success(data.message || "Account permanently deleted");
      fetchData(pagination.page);
    } catch (error: any) {
      // console.error("Error deleting account permanently:", error);
      toast.error(error.message || "Error deleting account");
    }
  };

  const cleanupExpiredAccounts = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/accounts/cleanup-expired`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Cleanup failed");
      }

      if (data.data?.accounts_deleted > 0) {
        toast.success(
          `Cleaned up ${data.data.accounts_deleted} accounts and ${data.data.images_deleted} images`,
        );
      } else {
        toast.info("No expired accounts to clean up");
      }

      fetchData(pagination.page);
    } catch (error: any) {
      // console.error("Cleanup error:", error);
      toast.error(error.message || "Error cleaning up expired accounts");
    }
  };

  const editAccount = (account: Account) => {
    if (account.deleted_at) {
      toast.error("Cannot edit an account that is marked for deletion");
      return;
    }

    setAccountForm({
      id: account.id,
      title: account.title,
      description: account.description,
      price: account.price.toString(),
      skins: account.skins.toString(),
      collector_level: account.collector_level || "",
      category: account.category || "mobile_legend",
      discount: account.discount ? account.discount.toString() : "",
      images: [], // New files will go here
      existingImages: account.images || [], // Existing URLs stay here
    });
    setIsEditing(true);
  };

  const resetAccountForm = () => {
    setAccountForm({
      id: "",
      title: "",
      description: "",
      price: "",
      skins: "0",
      collector_level: "",
      category: "",
      discount: "",
      images: [],
      existingImages: [],
    });
    setIsEditing(false);
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Remove from existing images (for editing)
      const newExistingImages = [...accountForm.existingImages];
      newExistingImages.splice(index, 1);
      setAccountForm((prev) => ({
        ...prev,
        existingImages: newExistingImages,
      }));
    } else {
      // Remove from new images
      const newImages = [...accountForm.images];
      newImages.splice(index, 1);
      setAccountForm((prev) => ({ ...prev, images: newImages }));
    }
  };

  const replaceImage = async (
    index: number,
    isExisting: boolean,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Original image size must be less than 20MB");
      return;
    }

    setCompressingImages(true);

    try {
      // Compress the replacement image
      const compressedImage = await compressImage(file);

      if (isExisting) {
        // For existing images, remove the old one and add the new compressed file
        const newExistingImages = [...accountForm.existingImages];
        newExistingImages.splice(index, 1);

        setAccountForm((prev) => ({
          ...prev,
          existingImages: newExistingImages,
          images: [...prev.images, compressedImage],
        }));
      } else {
        // For new images, replace at the same index
        const newImages = [...accountForm.images];
        newImages[index] = compressedImage;
        setAccountForm((prev) => ({ ...prev, images: newImages }));
      }

      toast.success("Image replaced and compressed successfully");
    } catch (error) {
      // console.error("Error compressing replacement image:", error);
      toast.error("Error compressing image");
    } finally {
      setCompressingImages(false);
    }

    e.target.value = "";
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
    fetchData(page);
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1, // Reset to first page
    }));
  };

  // Helper function to get image URL for preview
  const getImageUrl = (image: File | string): string => {
    if (typeof image === "string") {
      return image;
    }
    // For File objects, create object URL for preview
    return URL.createObjectURL(image);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any object URLs we created
      accountForm.images.forEach((image) => {
        if (image instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(image));
        }
      });
    };
  }, [accountForm.images]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin — Accounts</h1>
          <Button
            variant="outline"
            onClick={cleanupExpiredAccounts}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Cleanup Expired
          </Button>
        </div>

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
                  <Label htmlFor="title">Title *</Label>
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
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={accountForm.category}
                    onValueChange={(value) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        category: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(constants.categories).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
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

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="price">Price (MMK) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
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
                  <Input
                    id="skins"
                    type="hidden"
                    required
                    min="0"
                    value={accountForm.skins}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        skins: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="collector_level">Collector Level</Label>
                  <Select
                    value={accountForm.collector_level}
                    onValueChange={(value) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        collector_level: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {constants.collector_levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Images</Label>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading || compressingImages}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {compressingImages ? (
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">
                          {compressingImages
                            ? "Compressing images..."
                            : uploading
                              ? "Uploading..."
                              : "Click to upload multiple images"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Images will be compressed and converted to WebP format
                          (max 1200px, ~80% quality)
                        </p>
                      </div>
                    </Label>
                  </div>

                  {/* Show existing images (for editing) */}
                  {isEditing && accountForm.existingImages.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">
                        Existing Images ({accountForm.existingImages.length})
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                        {accountForm.existingImages.map((img, idx) => (
                          <div
                            key={`existing-${idx}`}
                            className="relative group"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <Image
                                src={img}
                                alt={`Existing ${idx + 1}`}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <label className="cursor-pointer">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => replaceImage(idx, true, e)}
                                  disabled={uploading || compressingImages}
                                  className="hidden"
                                  id={`replace-existing-${idx}`}
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white"
                                  disabled={compressingImages}
                                  asChild
                                >
                                  <span>
                                    {compressingImages ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Upload className="h-3 w-3" />
                                    )}
                                  </span>
                                </Button>
                              </label>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="h-6 w-6"
                                onClick={() => removeImage(idx, true)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-center mt-1 text-muted-foreground">
                              Existing {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show new images to upload */}
                  {accountForm.images.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">
                        New Images to Upload ({accountForm.images.length})
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                        {accountForm.images.map((img, idx) => (
                          <div key={`new-${idx}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <Image
                                src={getImageUrl(img)}
                                alt={`New ${idx + 1}`}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-br-lg">
                              WebP
                            </div>
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <label className="cursor-pointer">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => replaceImage(idx, false, e)}
                                  disabled={uploading || compressingImages}
                                  className="hidden"
                                  id={`replace-new-${idx}`}
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white"
                                  disabled={compressingImages}
                                  asChild
                                >
                                  <span>
                                    {compressingImages ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Upload className="h-3 w-3" />
                                    )}
                                  </span>
                                </Button>
                              </label>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="h-6 w-6"
                                onClick={() => removeImage(idx, false)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-center mt-1 text-muted-foreground">
                              {img instanceof File && (
                                <span>{formatFileSize(img.size)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant={"outline"}
                  disabled={loading || uploading || compressingImages}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
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
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                {/* Page Size Select */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    value={String(pagination.pageSize)}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Category:
                  </span>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="mobile_legend">
                        Mobile Legend
                      </SelectItem>
                      <SelectItem value="pubg">PUBG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">
                  Loading accounts...
                </p>
              ) : accounts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No accounts found. Create your first account above.
                </p>
              ) : (
                accounts.map((account) => {
                  const isMarkedForDeletion = account.sold_at;
                  const timeRemaining = isMarkedForDeletion
                    ? getTimeRemaining(account.sold_at!)
                    : null;

                  return (
                    <div
                      key={account.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isMarkedForDeletion
                          ? "bg-amber-50 border-amber-200 text-black"
                          : account.is_sold
                            ? "bg-gray-50 border-gray-200"
                            : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{account.title}</h3>
                          {account.is_sold && (
                            <Badge variant="secondary" className="text-xs">
                              Sold Out
                            </Badge>
                          )}
                          {isMarkedForDeletion && (
                            <Badge
                              variant="destructive"
                              className="text-xs flex items-center gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              Deleting in {timeRemaining?.hoursRemaining}h{" "}
                              {timeRemaining?.minutesRemaining}m
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(account.price).toLocaleString()} MMK
                          {account.discount && ` • ${account.discount}% off`}
                          {account.skins > 0 && ` • ${account.skins} skins`}
                        </p>
                        {account.category && (
                          <Badge
                            variant="outline"
                            className="text-xs dark:text-black mt-1"
                          >
                            {account.category === "mobile_legend"
                              ? "Mobile Legend"
                              : account.category === "pubg"
                                ? "PUBG"
                                : account.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!isMarkedForDeletion ? (
                          <>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteAccountPermanently(account.id)
                              }
                              disabled={account.is_sold}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Now
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreAccount(account.id)}
                            className="flex dark:text-black items-center gap-1"
                          >
                            <Undo className="h-3 w-3" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={i + 1 === pagination.page ? undefined : "ghost"}
                      size="sm"
                      onClick={() => goToPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
