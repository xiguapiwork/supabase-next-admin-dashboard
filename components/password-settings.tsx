"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface PasswordSettingsProps {
  user: {
    id: string;
    email: string;
  };
}

// 将PasswordInput组件移到外部定义，避免每次渲染时重新创建
const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  show, 
  onToggleShow,
  isLoading 
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  isLoading: boolean;
}) => (
  <div className="relative">
    <Input
      id={id}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={isLoading}
      className="pr-10"
    />
    <button
      type="button"
      onClick={onToggleShow}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      disabled={isLoading}
      tabIndex={-1}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
);

export function PasswordSettings({ user }: PasswordSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast.error("请输入当前密码");
      return;
    }

    if (!newPassword) {
      toast.error("请输入新密码");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("新密码至少需要6个字符");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("新密码不能与当前密码相同");
      return;
    }

    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // 验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("当前密码不正确");
        return;
      }

      // 更新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("密码更新成功！");
      
      // 清空表单
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("密码更新失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">当前密码</Label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="请输入当前密码"
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">新密码</Label>
          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="请输入新密码"
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
            isLoading={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            密码至少需要6个字符
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">确认新密码</Label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入新密码"
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            isLoading={isLoading}
          />
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full sm:w-auto"
          >
            {isLoading ? "更新中..." : "更新密码"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            disabled={isLoading}
          >
            清空
          </Button>
        </div>
      </form>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">密码安全提示</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 使用至少6个字符的密码</li>
          <li>• 建议包含大小写字母、数字和特殊字符</li>
          <li>• 不要使用容易猜测的密码</li>
          <li>• 定期更换密码以保护账号安全</li>
        </ul>
      </div>
    </div>
  );
}