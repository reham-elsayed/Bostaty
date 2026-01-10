import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export default async function Page({ searchParams }: { searchParams: { next?: string } }) {

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p>Loading...</p>}>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
