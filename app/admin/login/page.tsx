import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { LogoMark } from "@/components/site/logo";
import { SmartImage } from "@/components/ui/smart-image";
import { IMAGES } from "@/lib/data/seed";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <SmartImage src={IMAGES.skylineNight} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/30 to-ink" />
        <p className="absolute bottom-12 left-12 max-w-sm font-display text-4xl leading-tight">
          Premium Toronto Lifestyle. <span className="text-accent italic">Managed here.</span>
        </p>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <LogoMark className="size-10 text-accent" />
          <h1 className="mt-8 font-display text-5xl">Admin sign in</h1>
          <p className="mt-3 text-sm text-muted">Authorized staff only. All access is logged.</p>
          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
