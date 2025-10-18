"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Settings, LogOut, Monitor, Sun, Moon, User, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface UserDropdownProps {
  user: {
    id: string;
    email: string;
  };
  profile: {
    username?: string;
  } | null;
  avatarUrl: string | null;
}

export function UserDropdown({ user, profile, avatarUrl }: UserDropdownProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 h-auto hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none">
          <Avatar className="h-10 w-10 border border-gray-300">
            <AvatarImage src={avatarUrl || undefined} alt={profile?.username || user.email || "用户头像"} />
            <AvatarFallback>
              {(profile?.username || user.email || "用户")?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="px-3 py-2">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-foreground" />
              <p className="text-sm font-medium text-foreground">{profile?.username || "用户"}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-foreground" />
              <p className="text-sm text-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/protected/settings')} className="px-3 py-2">
          <div className="flex items-center space-x-3">
            <Settings className="h-4 w-4 text-foreground" />
            <span className="text-sm text-foreground">设置</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-2 text-sm text-foreground">主题</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="system" className="pl-8 pr-3 py-2">
            <div className="flex items-center space-x-3">
              <Monitor className="h-4 w-4 text-foreground" />
              <span className="text-sm text-foreground">系统</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light" className="pl-8 pr-3 py-2">
            <div className="flex items-center space-x-3">
              <Sun className="h-4 w-4 text-foreground" />
              <span className="text-sm text-foreground">浅色</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="pl-8 pr-3 py-2">
            <div className="flex items-center space-x-3">
              <Moon className="h-4 w-4 text-foreground" />
              <span className="text-sm text-foreground">深色</span>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="px-3 py-2">
          <div className="flex items-center space-x-3">
            <LogOut className="h-4 w-4 text-foreground" />
            <span className="text-sm text-foreground">登出</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}