'use client'

import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { generateAvatarUrl } from "@/lib/avatar-utils";
import { UserDropdown } from "./user-dropdown";
import { PointsExchangeDialog } from "./points-exchange-dialog";

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    sub: string;
  } | null>(null);
  const [profile, setProfile] = useState<{
    username?: string;
    points?: number;
    avatar?: string;
    role?: string;
  } | null>(null);
  const [isExchangeDialogOpen, setIsExchangeDialogOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      const currentUser = data?.claims;
      setUser(currentUser ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (currentUser as any).sub || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: (currentUser as any).email || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sub: (currentUser as any).sub || ''
      } : null);

      // 获取用户资料信息
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('user-management')
          .select('username, points, avatar, role')
          .eq('id', currentUser.sub)
          .single();
        setProfile(profileData);
      }
    };

    getUser();
  }, []);

  // 检查当前路径是否匹配导航项
  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav className="w-full flex border-b border-b-foreground/10 h-16">
      <div className="w-full flex items-center p-3 px-5 text-sm relative">
        {/* 左侧：网站标题 */}
        <div className="flex items-center">
          <Link href={"/"} className="text-lg font-semibold">supabase-dashboard</Link>
        </div>
        
        {/* 中间：导航按钮（仅登录后显示，绝对居中） */}
        {user && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-sm font-semibold p-0 h-auto hover:bg-transparent relative ${
                  isActive('/') 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                主页
                {isActive('/') && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                )}
              </Button>
            </Link>
            <Link href="/protected/settings">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-sm font-semibold p-0 h-auto hover:bg-transparent relative ${
                  isActive('/protected/settings') 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                账号设置
                {isActive('/protected/settings') && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                )}
              </Button>
            </Link>
            {/* 后台设置按钮 - 仅admin可见 */}
            {profile?.role === 'admin' && (
              <Link href="/protected/admin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-sm font-semibold p-0 h-auto hover:bg-transparent relative ${
                    isActive('/protected/admin') 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  后台设置
                  {isActive('/protected/admin') && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  )}
                </Button>
              </Link>
            )}
          </div>
        )}
        
        {/* 右侧：认证按钮和主题切换 */}
        <div className="flex items-center gap-4 ml-auto">
          {!hasEnvVars ? <EnvVarWarning /> : (
            user ? (
              <div className="flex items-center gap-4">
                {/* 积分显示和兑换按钮 */}
                <div className="flex items-center bg-muted rounded-full px-3 py-1">
                  <div className="flex items-center gap-2">
                    <svg 
                      width={24} 
                      height={24} 
                      viewBox="0 0 1024 1024" 
                      className="text-foreground"
                      fill="currentColor"
                    >
                      <path d="M640 224c19.2 0 38.4 9.6 51.2 25.6l118.4 156.8c19.2 25.6 16 57.6-3.2 80l-246.4 275.2c-22.4 25.6-64 28.8-89.6 6.4-3.2 0-3.2-3.2-3.2-3.2l-249.6-275.2c-19.2-22.4-22.4-57.6-3.2-83.2l118.4-156.8c12.8-16 32-25.6 51.2-25.6h256z m0 64h-256l-118.4 156.8 246.4 275.2 246.4-275.2L640 288z m-128 128c35.2 0 64 28.8 64 64s-28.8 64-64 64-64-28.8-64-64 28.8-64 64-64z"/>
                    </svg>
                    <span className="font-medium">{profile?.points || 0}</span>
                  </div>
                  <div className="mx-2 h-4 w-px bg-gray-400 dark:bg-white"></div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 text-sm hover:bg-transparent"
                    onClick={() => setIsExchangeDialogOpen(true)}
                  >
                    积分兑换
                  </Button>
                </div>
                
                {/* 用户头像下拉菜单 */}
                <UserDropdown user={user} profile={profile} avatarUrl={generateAvatarUrl(profile)} />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button asChild size="sm" variant={"outline"}>
                  <Link href="/auth/sign-up">注册</Link>
                </Button>
                <Button asChild size="sm" variant={"default"}>
                  <Link href="/auth/login">登录</Link>
                </Button>
              </div>
            )
          )}
          {!user && <ThemeSwitcher />}
        </div>
      </div>
      
      {/* 积分兑换对话框 */}
      {user && (
        <PointsExchangeDialog
          isOpen={isExchangeDialogOpen}
          onClose={() => setIsExchangeDialogOpen(false)}
          onSuccess={() => {
            // 兑换成功后刷新用户积分
            const refreshProfile = async () => {
              const supabase = createClient();
              const { data } = await supabase
                .from('profiles')
                .select('username, points, avatar, role')
                .eq('id', user!.id)
                .single();
              if (data) {
                setProfile(data);
              }
            };
            refreshProfile();
            setIsExchangeDialogOpen(false);
          }}
        />
      )}
    </nav>
  );
}