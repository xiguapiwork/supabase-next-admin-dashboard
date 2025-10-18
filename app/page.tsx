import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Header />
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Supabase Next Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              基于 Supabase 和 Next.js 构建的现代化后台管理系统
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>实时数据库</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>用户认证</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>管理面板</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
