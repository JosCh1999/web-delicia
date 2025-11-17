"use client"

import { signOut } from "firebase/auth";
import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

export function UserNav() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    Cookies.remove("session");
    router.push('/admin/login');
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userProfile?.imagen_perfil} alt={userProfile?.nombre ?? ""} />
            <AvatarFallback>
              {userProfile?.nombre ? getInitials(userProfile.nombre) : <UserIcon />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile?.nombre}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile?.correo}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
