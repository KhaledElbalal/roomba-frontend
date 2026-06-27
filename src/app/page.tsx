import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Roomba</CardTitle>
          <CardDescription>
            End-to-end auth slice: sign in with Neon Auth, then call the Rails
            backend with your session token.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button render={<Link href="/auth/sign-in" />}>Sign in</Button>
          <Button variant="outline" render={<Link href="/dashboard" />}>
            Go to dashboard
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
