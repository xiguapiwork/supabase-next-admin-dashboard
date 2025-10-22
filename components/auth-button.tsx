import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { UserDropdown } from "./user-dropdown";
import { generateAvatarUrl } from "@/lib/avatar-utils";

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

  // 使用统一的头像URL生成函数
  const getAvatarUrl = () => {
    return generateAvatarUrl(profile);
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
