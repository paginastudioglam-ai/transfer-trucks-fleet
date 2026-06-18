"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Truck, Mail } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `https://transfer-trucks-fleet.vercel.app/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
            <Mail className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Check your email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>. Click the link
              to sign in.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
          <Truck className="h-6 w-6 text-brand" />
        </div>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email to sign in to your fleet dashboard
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="carlos@transfertruckscorp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send magic link"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
