import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarSettings } from "@/components/avatar-settings";
import { UsernameSettings } from "@/components/username-settings";
import { generateAvatarUrl } from "@/lib/avatar-utils";
import { PasswordSettings } from "@/components/password-settings";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 获取用户资料信息
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, points, avatar, role')
    .eq('id', user.id)
    .single();

  // 生成头像URL
  const avatarUrl = generateAvatarUrl(profile);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* 设置卡片 - 两列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 第一列：头像设置和用户名设置 */}
        <div className="space-y-6">
          {/* 头像设置 */}
          <Card>
            <CardHeader>
              <CardTitle>头像设置</CardTitle>
            </CardHeader>
            <CardContent>
              <AvatarSettings 
                user={{ id: user.id, email: user.email }} 
                profile={profile || {}} 
                avatarUrl={avatarUrl} 
              />
            </CardContent>
          </Card>

          {/* 用户名设置 */}
          <Card>
            <CardHeader>
              <CardTitle>用户名设置</CardTitle>
            </CardHeader>
            <CardContent>
              <UsernameSettings 
                user={{ id: user.id, email: user.email || '' }} 
                profile={profile} 
              />
            </CardContent>
          </Card>
        </div>

        {/* 第二列：密码设置 */}
        <div className="space-y-6">
          {/* 密码设置 */}
          <Card>
            <CardHeader>
              <CardTitle>密码设置</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordSettings user={{ id: user.id, email: user.email || '' }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}