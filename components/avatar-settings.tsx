"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Camera, Upload, X } from "lucide-react";

interface AvatarSettingsProps {
  user: {
    id: string;
    email?: string;
  };
  profile: {
    username?: string;
    points?: number;
    avatar?: string;
    role?: string;
  };
  avatarUrl: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AvatarSettings({ user, profile, avatarUrl }: AvatarSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 获取当前头像URL
  const getCurrentAvatarUrl = () => {
    if (previewUrl) return previewUrl; // 如果有预览图，优先显示
    if (!profile?.avatar) return null;
    
    // 如果是默认头像
    if (profile.avatar.includes('.png') && !profile.avatar.includes('/')) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/default-avatar/${profile.avatar}`;
    }
    
    // 如果是用户上传的头像
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatar/${profile.avatar}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件");
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件大小不能超过 5MB");
      return;
    }

    setSelectedFile(file);
    
    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 上传文件到存储桶
      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(filePath, selectedFile, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // 如果有旧头像且不是默认头像，删除旧文件
      if (profile?.avatar && !profile.avatar.includes('default-avatar') && profile.avatar.includes('/')) {
        await supabase.storage
          .from('avatar')
          .remove([profile.avatar]);
      }

      // 更新用户资料中的头像路径
      const { error: updateError } = await supabase
        .from('user-management')
        .update({ avatar: filePath })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success("头像更新成功！");
      router.refresh();
      
      // 清理状态
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error("头像更新失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* 头像显示区域 */}
      <div className="flex items-center justify-center">
        <div 
          className="relative group cursor-pointer"
          onClick={triggerFileSelect}
        >
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={getCurrentAvatarUrl() || undefined} 
              alt={profile?.username || user.email || "用户头像"} 
            />
            <AvatarFallback className="text-xl">
              {(profile?.username || user.email || "用户")?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* 悬浮相机图标 */}
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* 按钮区域 - 固定高度容器 */}
      <div className="flex justify-center min-h-[40px]">
        {selectedFile ? (
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={isLoading}
              className="flex items-center gap-2 h-10"
            >
              <Upload className="h-4 w-4" />
              {isLoading ? "保存中..." : "保存更改"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={triggerFileSelect}
            disabled={isLoading}
            className="h-10"
          >
            更改头像
          </Button>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}