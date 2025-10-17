"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UsernameSettingsProps {
  user: {
    id: string;
    email: string;
  };
  profile: {
    username?: string;
  } | null;
}

export function UsernameSettings({ user, profile }: UsernameSettingsProps) {
  const [username, setUsername] = useState(profile?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("用户名不能为空");
      return;
    }

    if (username.length < 2) {
      toast.error("用户名至少需要2个字符");
      return;
    }

    if (username.length > 20) {
      toast.error("用户名不能超过20个字符");
      return;
    }

    // 检查用户名格式（只允许字母、数字、中文、下划线和连字符）
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      toast.error("用户名只能包含中文、字母、数字、下划线和连字符");
      return;
    }

    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // 检查用户名是否已存在
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        toast.error("该用户名已被使用，请选择其他用户名");
        return;
      }

      // 更新用户名
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success("用户名更新成功！");
      router.refresh();
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error("用户名更新失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const isChanged = username !== (profile?.username || "");

  return (
    <div className="space-y-6">
      <form onSubmit={handleUsernameUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            disabled={isLoading}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            用户名长度为2-20个字符，只能包含中文、字母、数字、下划线和连字符
          </p>
        </div>

        <div className="space-y-2">
          <Label>邮箱地址</Label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="max-w-md bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            邮箱地址无法更改，如需更改请联系管理员
          </p>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading || !isChanged}
            className="w-full sm:w-auto"
          >
            {isLoading ? "更新中..." : "保存更改"}
          </Button>
          
          {isChanged && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setUsername(profile?.username || "")}
              disabled={isLoading}
            >
              取消
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}