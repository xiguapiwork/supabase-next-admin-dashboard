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
  );
}
