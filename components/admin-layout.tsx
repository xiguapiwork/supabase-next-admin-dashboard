'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, CreditCard, FileText, Settings, Database, Menu, X } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  onPageChange?: (page: string) => void
  currentPath?: string
  headerActions?: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: false,
    displayName: '数据看板 Dashboard'
  },
  {
    name: 'User Management',
    href: '/users',
    icon: Users,
    current: false,
    displayName: '用户管理 User Management'
  },
  {
    name: 'Exchange Cards',
    href: '/exchange-cards',
    icon: CreditCard,
    current: false,
    displayName: '兑换卡管理 Exchange Cards'
  },
  {
    name: 'Points Logs',
    href: '/points-logs',
    icon: FileText,
    current: false,
    displayName: '积分变动日志 Points Logs'
  },
  {
    name: 'Task Logs',
    href: '/task-logs',
    icon: FileText,
    current: false,
    displayName: '任务日志 Task Logs'
  },
  {
    name: 'Setting',
    href: '/setting',
    icon: Settings,
    current: false,
    displayName: '设置 Setting'
  },
  {
    name: 'Database Test',
    href: '/database-test',
    icon: Database,
    current: false,
    displayName: '数据库测试 Database Test'
  },
]

export function AdminLayout({ children, onPageChange, currentPath = '/dashboard', headerActions }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavClick = (href: string) => {
    onPageChange?.(href)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="px-3 py-6 flex flex-col flex-1">
          {/* Mobile close button */}
          <div className="flex justify-end mb-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ul className="space-y-2 flex-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href
              return (
                <li key={item.name}>
                  <Button
                    variant={isActive ? "ghost" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-11",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => handleNavClick(item.href)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-card flex items-center px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-4 self-center"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-medium">
              {navigation.find(item => item.href === currentPath)?.displayName || 'Dashboard'}
            </h2>
          </div>
          {headerActions && (
            <div className="flex gap-2">
              {headerActions}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}