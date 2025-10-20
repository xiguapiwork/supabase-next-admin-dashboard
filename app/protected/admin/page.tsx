import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin-app";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 获取用户资料信息（包括角色）
  const { data: profile } = await supabase
    .from('user-management')
    .select('role')
    .eq('id', user.id)
    .single();

  // 检查是否为管理员
  if (profile?.role !== 'admin') {
    redirect("/protected/settings"); // 非管理员重定向到普通设置页面
  }

  return (
    <AdminApp initialPage="/dashboard" />
  );
}