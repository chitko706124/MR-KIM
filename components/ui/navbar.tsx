"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Search, Menu, X, Sun, Moon, Globe, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo2 from "../image/Logo2.png";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState(() => {
    try {
      return (
        (typeof window !== "undefined" && localStorage.getItem("language")) ||
        "en"
      );
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("language", language);
      }
      document.documentElement.lang = language;
    } catch (e) {
      // ignore
    }
  }, [language]);

  const navLinks = [
    { href: "tg://resolve?domain=kim_mlbb_diamond_shop", label: "Support" },
  ];

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = (data as any)?.session;
        const email = session?.user?.email;
        if (!email) {
          setIsAdmin(false);
          return;
        }

        const { data: adminData, error } = await supabase
          .from("admin_users")
          .select("id")
          .eq("email", email)
          .single();

        if (!error && adminData) setIsAdmin(true);
        else setIsAdmin(false);
      } catch (err) {
        console.error("admin check error", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={Logo2}
              alt="Logo"
              width={40}
              height={40}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MR.KIM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  href="/admin/accounts"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Manage Accounts
                </Link>
                <Link
                  href="/admin/ads"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Manage Ads
                </Link>
                <Link
                  href="/admin/profile"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-20">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="mm">MM</SelectItem>
                </SelectContent>
              </Select>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Admin Login button */}
              {!isAdmin && (
                <Link href="/admin/login">
                  <Button variant="outline" size="sm" className="ml-2">
                    {" "}
                    Admin Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-6 mt-8">
                    {/* Navigation Links */}
                    <div className="space-y-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block text-lg font-medium transition-colors hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/accounts"
                            className="block text-lg font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            Manage Accounts
                          </Link>
                          <Link
                            href="/admin/ads"
                            className="block text-lg font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            Manage Ads
                          </Link>
                          <Link
                            href="/admin/profile"
                            className="block text-lg font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            Profile
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Language</span>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-20">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">EN</SelectItem>
                            <SelectItem value="mm">MM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Theme</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setTheme(theme === "light" ? "dark" : "light")
                          }
                        >
                          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                      </div>
                    </div>
                    {/* Admin Login button */}
                    {!isAdmin && (
                      <Link href="/admin/login">
                        <Button variant="outline" size="sm">
                          Admin Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
