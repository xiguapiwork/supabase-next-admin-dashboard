import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Header />
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              欢迎使用 Supabanana
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              您的智能助手平台
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
