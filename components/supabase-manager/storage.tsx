'use client'

import { useGetBuckets } from '@/hooks/use-storage'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Folder } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function StorageManager({ projectRef }: { projectRef: string }) {
  const { data: buckets, isLoading, isError } = useGetBuckets(projectRef)

  return (
    <div className="p-6 pt-4 lg:p-8 lg:pt-8">
      <h1 className="text-base lg:text-xl font-semibold">存储</h1>
      <p className="hidden lg:block text-sm lg:text-base text-muted-foreground mt-1">
        查看和管理应用程序中存储的文件。
      </p>

      {isLoading && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      {isError && (
        <Alert variant="destructive" className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>加载存储桶时出错</AlertTitle>
          <AlertDescription>加载您的存储桶时出现问题。</AlertDescription>
        </Alert>
      )}

      {buckets && buckets.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buckets.map((bucket: { id: string; name: string; updated_at: string; public: boolean }) => (
            <Tooltip key={bucket.id}>
              <TooltipTrigger asChild>
                <Button
                  key={bucket.id}
                  variant="outline"
                  className="flex-row justify-start text-left h-auto p-4 gap-4"
                >
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <h2 className="font-semibold mb-1">{bucket.name}</h2>

                    <p className="text-xs text-muted-foreground">
                      更新于 {new Date(bucket.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={bucket.public ? 'default' : 'secondary'}>
                    {bucket.public ? '公开' : '私有'}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>文件查看功能即将推出</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      ) : buckets && buckets.length === 0 ? (
        <Alert className="mt-8">
          <Folder className="h-4 w-4" />
          <AlertTitle>没有存储桶</AlertTitle>
          <AlertDescription>
            存储桶是用于在应用程序中存储和保护文件的容器。
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
