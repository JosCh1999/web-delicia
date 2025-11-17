"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Boxes, Cookie, Loader2, LogOut, PanelLeft, Users } from 'lucide-react';
import Link from 'next/link';

import { cn } from "@/lib/utils"
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/icons/logo';
import { signOut } from 'firebase/auth';
import Cookies from 'js-cookie';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  
  const handleSignOut = async () => {
    await signOut(auth);
    Cookies.remove("session");
    router.push('/login');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && user && userProfile?.rol !== 'admin') {
      // Not an admin, sign out and redirect
      handleSignOut();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, loading, router]);

  if (loading || !user || !userProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { href: "/admin", icon: Users, label: "Dashboard" },
    { href: "/admin/pedidos", icon: Boxes, label: "Pedidos" },
    { href: "/admin/inventario", icon: Cookie, label: "Inventario" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/admin"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Dulce Sabor</span>
          </Link>
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSignOut} variant="ghost" size="icon" className="h-9 w-9 md:h-8 md:w-8 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Cerrar sesión</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar sesión</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/admin"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Dulce Sabor</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-2.5",
                      pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                 <button
                    onClick={handleSignOut}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </button>
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="font-headline text-xl font-semibold hidden sm:block">Panel Dulce Sabor</h1>
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Can add a search bar here in the future */}
          </div>
          <UserNav />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
