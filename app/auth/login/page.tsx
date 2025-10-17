import { LoginForm } from "@/components/login-form";
import { Header } from "@/components/header";

export default function Page() {
  return (
    <div className="min-h-svh w-full flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
