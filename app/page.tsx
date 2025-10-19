import { Header } from "@/components/header";

export default async function Index() {

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <Header />
      <main className="w-full max-w-4xl px-6 py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            欢迎使用 SupaBanana
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            一个基于 Next.js 和 Supabase 构建的现代化全栈应用模板
          </p>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Next.js 14</h3>
            <p className="text-muted-foreground">
              使用最新的 Next.js 框架，支持 App Router、Server Components 和 TypeScript
            </p>
          </div>

          <div className="p-6 border rounded-lg space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Supabase</h3>
            <p className="text-muted-foreground">
              开源的 Firebase 替代方案，提供数据库、认证、实时订阅和存储功能
            </p>
          </div>

          <div className="p-6 border rounded-lg space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">用户认证</h3>
            <p className="text-muted-foreground">
              内置完整的用户认证系统，支持注册、登录、密码重置等功能
            </p>
          </div>

          <div className="p-6 border rounded-lg space-y-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">响应式设计</h3>
            <p className="text-muted-foreground">
              使用 Tailwind CSS 构建，完美适配桌面端和移动端设备
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-semibold">开始使用</h2>
          <p className="text-muted-foreground">
            登录或注册账户，体验完整的应用功能
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/auth/login"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              登录
            </a>
            <a
              href="/auth/sign-up"
              className="px-6 py-3 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              注册
            </a>
          </div>
        </section>
      </main>
      
      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{' '}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
          {' '}and{' '}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Next.js
          </a>
        </p>
      </footer>
    </div>
  );
}
