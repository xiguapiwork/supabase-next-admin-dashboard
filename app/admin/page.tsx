import { redirect } from "next/navigation";

export default function AdminPage() {
  // 重定向到受保护的admin页面
  redirect("/protected/admin");
}