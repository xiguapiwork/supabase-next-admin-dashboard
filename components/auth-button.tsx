import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { UserDropdown } from "./user-dropdown";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/sign-up">注册</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/login">登录</Link>
        </Button>
      </div>
    );
  }

  // 获取用户资料信息
  const { data: profile } = await supabase
    .from('user-management')
    .select('username, points, avatar, role')
    .eq('id', user.sub)
    .single();

  // 生成头像URL - 与avatar-settings.tsx中的逻辑保持一致
  const getAvatarUrl = () => {
    if (!profile?.avatar) return null;
    
    // 如果是默认头像
    if (profile.avatar.includes('.png') && !profile.avatar.includes('/')) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/default-avatar/${profile.avatar}`;
    }
    
    // 如果是用户上传的头像
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatar/${profile.avatar}`;
  };

  const avatarUrl = getAvatarUrl();

  return (
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
        <Button variant="ghost" size="sm" className="h-auto p-1 text-sm hover:bg-transparent">
          积分兑换
        </Button>
      </div>
      
      {/* 用户头像下拉菜单 */}
      <UserDropdown 
        user={{ 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (user as any).sub || '', 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (user as any).email || '' 
        }} 
        profile={profile} 
        avatarUrl={avatarUrl} 
      />
    </div>
  );
}
