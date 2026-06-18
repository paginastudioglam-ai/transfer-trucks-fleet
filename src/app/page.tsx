import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center gap-2">
            <img
              src="https://transfertruckscorp.com/wp-content/uploads/2026/02/LOgo-1.webp"
              alt="Transfer Trucks"
              className="h-10 w-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Fleet Manager
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
