/**
 * 头像URL生成工具函数
 * 统一处理默认头像和用户上传头像的URL生成逻辑
 */

interface Profile {
  avatar?: string | null;
}

// 默认头像列表（与 public/default-avatar 文件夹中的文件对应）
export const DEFAULT_AVATARS = [
  '橙子.png',
  '苹果.png', 
  '草莓.png',
  '菠萝.png',
  '蓝莓.png',
  '西瓜.png',
  '鸭梨.png'
] as const;

/**
 * 获取随机默认头像
 * @returns 随机默认头像文件名
 */
export function getRandomDefaultAvatar(): string {
  const randomIndex = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  return DEFAULT_AVATARS[randomIndex];
}

/**
 * 生成头像URL
 * @param profile 用户资料对象，包含avatar字段
 * @returns 头像URL字符串或null
 */
export function generateAvatarUrl(profile: Profile | null): string | null {
  if (!profile?.avatar) return null;
  
  // 如果是默认头像（只包含文件名，不包含路径）
  if (profile.avatar.includes('.png') && !profile.avatar.includes('/')) {
    return `/default-avatar/${profile.avatar}`;
  }
  
  // 如果是用户上传的头像
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatar/${profile.avatar}`;
}