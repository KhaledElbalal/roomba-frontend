import { AuthView } from "@neondatabase/auth/react/ui";


export default async function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <AuthView pathname={pathname} redirectTo="/dashboard" />
      </div>
    </main>
  );
}
