import { useContext, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthUserContext } from "@/lib/auth-state";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | Vidya Enterprise" },
      { name: "description", content: "Sign in or register for the Vidya Enterprise wholesale workspace." },
      { property: "og:title", content: "Sign in | Vidya Enterprise" },
      { property: "og:description", content: "Access the Vidya Enterprise commerce and distribution workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const user = useContext(AuthUserContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true);
    try {
      if (mode === "register") {
        const displayName = String(form.get("displayName") ?? "").trim();
        const phone = String(form.get("phone") ?? "").trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: displayName, phone } },
        });
        if (error) throw error;
        if (!data.session) {
          setConfirmationSent(true);
          return;
        }
        toast.success("Your Vidya account is ready.");
        await navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't complete that request.");
    } finally {
      setBusy(false);
    }
  }

  async function socialSignIn(provider: "google" | "lovable") {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in could not be started.");
      setBusy(false);
    }
  }

  const isRegistering = mode === "register";
  return (
    <main className="auth-page min-h-screen bg-background text-foreground">
      <div className="auth-topbar">
        <Link to="/" className="vidya-brand" aria-label="Vidya Enterprise home">
          <span className="vidya-mark"><Building2 size={19} strokeWidth={1.8} /></span>
          <span className="font-semibold">vidya<span className="font-normal text-muted-foreground"> enterprise</span></span>
        </Link>
        <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to workspace</Link>
      </div>
      <div className="auth-grid">
        <section className="auth-story">
          <div className="auth-story-content">
            <span className="eyebrow">WHOLESALE, CONNECTED</span>
            <h1>Move your business<br />forward with Vidya.</h1>
            <p>One dependable place for buying, selling, and delivering the essentials that keep local businesses moving.</p>
            <div className="auth-proof"><span className="auth-proof-icon"><CheckCircle2 size={19} /></span><span>Built around the way your business works.</span></div>
          </div>
          <div className="auth-story-footer">A shared workspace for every step, from order to doorstep.</div>
        </section>
        <section className="auth-form-wrap" aria-labelledby="auth-heading">
          {user ? (
            <div className="auth-card">
              <div className="auth-icon"><CheckCircle2 size={22} /></div>
              <h2 id="auth-heading">You’re signed in</h2>
              <p className="auth-intro">{user.email}</p>
              <Button className="w-full" onClick={() => navigate({ to: "/" })}>Open workspace <ArrowRight size={16} /></Button>
            </div>
          ) : confirmationSent ? (
            <div className="auth-card">
              <div className="auth-icon"><Mail size={22} /></div>
              <span className="eyebrow">ONE LAST STEP</span>
              <h2 id="auth-heading">Check your inbox</h2>
              <p className="auth-intro">We sent a confirmation link to your email. Confirm it to activate your Vidya account.</p>
              <Button variant="outline" className="w-full" onClick={() => setConfirmationSent(false)}>Return to sign in</Button>
            </div>
          ) : (
            <div className="auth-card">
              <span className="eyebrow">VIDYA ENTERPRISE</span>
              <h2 id="auth-heading">{isRegistering ? "Create your account" : "Welcome back"}</h2>
              <p className="auth-intro">{isRegistering ? "Get started with your business workspace." : "Sign in to continue to your business workspace."}</p>
              <div className="auth-mode" role="tablist" aria-label="Account access">
                <button type="button" role="tab" aria-selected={!isRegistering} className={!isRegistering ? "active" : ""} onClick={() => setMode("login")}>Sign in</button>
                <button type="button" role="tab" aria-selected={isRegistering} className={isRegistering ? "active" : ""} onClick={() => setMode("register")}>Register</button>
              </div>
              <div className="auth-socials">
                <Button variant="outline" className="auth-social" disabled={busy} onClick={() => socialSignIn("google")}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                  Continue with Google
                </Button>
                <Button variant="outline" className="auth-social" disabled={busy} onClick={() => socialSignIn("lovable")}><span className="lovable-gem">✦</span> Continue with Lovable</Button>
              </div>
              <div className="auth-divider"><span>or use email</span></div>
              <form onSubmit={submit} className="auth-fields">
                {isRegistering && <>
                  <div className="auth-field"><Label htmlFor="displayName">Your name</Label><Input id="displayName" name="displayName" placeholder="e.g. Priya Sharma" autoComplete="name" required /></div>
                  <div className="auth-field"><Label htmlFor="phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" /></div>
                </>}
                <div className="auth-field"><Label htmlFor="email">Business email</Label><Input id="email" name="email" type="email" placeholder="you@business.com" autoComplete="email" required /></div>
                <div className="auth-field"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label>{!isRegistering && <span className="text-xs text-muted-foreground">Contact your administrator to reset</span>}</div><div className="auth-password"><Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" autoComplete={isRegistering ? "new-password" : "current-password"} minLength={8} required /><Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</Button></div></div>
                <Button type="submit" className="auth-submit" disabled={busy}>{busy ? "Please wait…" : isRegistering ? "Create account" : "Sign in"}<ArrowRight size={16} /></Button>
              </form>
              <p className="auth-legal">By continuing, you agree to use Vidya in accordance with your organization’s policies.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}