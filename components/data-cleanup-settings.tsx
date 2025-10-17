"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface DataCleanupSettingsProps {
  user: {
    id: string;
    email?: string;
  };
}

export function DataCleanupSettings({ user: _user }: DataCleanupSettingsProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = _user; // Keep user available for future use
  // 清除长时间未登录用户的设置
  const [inactiveUserDays, setInactiveUserDays] = useState("180");
  const [inactiveUserPoints, setInactiveUserPoints] = useState("0");
  
  // 清除兑换卡的设置
  const [cardCleanupDays, setCardCleanupDays] = useState("90");
  const [cardCleanupStatus, setCardCleanupStatus] = useState("已兑换");
  
  // 清除积分日志的设置
  const [logCleanupDays, setLogCleanupDays] = useState("90");
  
  // 确认对话框状态
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'users' | 'cards' | 'logs';
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  // 处理清除长时间未登录用户
  const handleCleanupInactiveUsers = () => {
    setConfirmAction({
      type: 'users',
      title: '确认清除长时间未登录用户',
      description: `将清除超过 ${inactiveUserDays} 天未登录且积分小于等于 ${inactiveUserPoints} 的用户。此操作不可撤销。`,
      action: () => {
        // 这里应该调用实际的API
        console.log('清除长时间未登录用户:', {
          days: inactiveUserDays,
          maxPoints: inactiveUserPoints
        });
        toast.success(`已清除超过 ${inactiveUserDays} 天未登录的用户`);
        setIsConfirmDialogOpen(false);
      }
    });
    setIsConfirmDialogOpen(true);
  };

  // 处理清除兑换卡
  const handleCleanupCards = () => {
    setConfirmAction({
      type: 'cards',
      title: '确认清除兑换卡',
      description: `将清除创建超过 ${cardCleanupDays} 天且状态为"${cardCleanupStatus}"的兑换卡。此操作不可撤销。`,
      action: () => {
        // 这里应该调用实际的API
        console.log('清除兑换卡:', {
          days: cardCleanupDays,
          status: cardCleanupStatus
        });
        toast.success(`已清除超过 ${cardCleanupDays} 天的${cardCleanupStatus}兑换卡`);
        setIsConfirmDialogOpen(false);
      }
    });
    setIsConfirmDialogOpen(true);
  };

  // 处理清除积分日志
  const handleCleanupLogs = () => {
    setConfirmAction({
      type: 'logs',
      title: '确认清除积分日志',
      description: `将清除超过 ${logCleanupDays} 天的积分记录。此操作不可撤销。`,
      action: () => {
        // 这里应该调用实际的API
        console.log('清除积分日志:', {
          days: logCleanupDays
        });
        toast.success(`已清除超过 ${logCleanupDays} 天的积分日志`);
        setIsConfirmDialogOpen(false);
      }
    });
    setIsConfirmDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* 清除长时间未登录用户 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-medium">清除长时间未登录用户</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inactive-days">未登录天数</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="inactive-days"
                  type="number"
                  value={inactiveUserDays}
                  onChange={(e) => setInactiveUserDays(e.target.value)}
                  className="flex-1"
                  min="1"
                />
                <span className="text-sm text-muted-foreground">天</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inactive-points">积分条件</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">≤</span>
                <Input
                  id="inactive-points"
                  type="number"
                  value={inactiveUserPoints}
                  onChange={(e) => setInactiveUserPoints(e.target.value)}
                  className="flex-1"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">积分</span>
              </div>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleCleanupInactiveUsers}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清除长时间未登录用户
          </Button>
        </div>

        <Separator />

        {/* 清除兑换卡 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-medium">清除兑换卡</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-days">创建天数</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="card-days"
                  type="number"
                  value={cardCleanupDays}
                  onChange={(e) => setCardCleanupDays(e.target.value)}
                  className="flex-1"
                  min="1"
                />
                <span className="text-sm text-muted-foreground">天</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-status">卡片状态</Label>
              <Select value={cardCleanupStatus} onValueChange={setCardCleanupStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="已兑换">已兑换</SelectItem>
                  <SelectItem value="所有状态">所有状态</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleCleanupCards}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清除兑换卡
          </Button>
        </div>

        <Separator />

        {/* 清除积分日志 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-medium">清除积分日志</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-days">日志天数</Label>
            <div className="flex items-center gap-2">
              <Input
                id="log-days"
                type="number"
                value={logCleanupDays}
                onChange={(e) => setLogCleanupDays(e.target.value)}
                className="flex-1"
                min="1"
              />
              <span className="text-sm text-muted-foreground">天</span>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleCleanupLogs}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清除积分日志
          </Button>
        </div>
      </div>

      {/* 确认对话框 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {confirmAction?.title}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmAction?.action}
            >
              确认清除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}