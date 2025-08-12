
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/Logo";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";
  const { toast } = useToast();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Si déjà connecté, on redirige
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(from, { replace: true });
    });
  }, [navigate, from]);

  const handleSignIn = async () => {
    setPending(true);
    console.log("[Auth] Sign in with password");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);

    if (error) {
      console.error(error);
      toast({ title: "Connexion échouée", description: error.message, variant: "destructive" as any });
      return;
    }
    toast({ title: "Connecté", description: "Vous êtes maintenant connecté." });
    navigate(from, { replace: true });
  };

  const handleSignUp = async () => {
    setPending(true);
    console.log("[Auth] Sign up with password");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${from}` }
    });
    setPending(false);

    if (error) {
      console.error(error);
      toast({ title: "Inscription échouée", description: error.message, variant: "destructive" as any });
      return;
    }

    toast({
      title: "Inscription réussie",
      description:
        "Compte créé. Selon la configuration, vous pourriez devoir confirmer votre email. Essayez de vous connecter.",
    });
    setMode("signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Logo className="h-10 w-auto" />
          </div>
          <CardTitle className="text-center">
            {mode === "signin" ? "Connexion" : "Créer un compte"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          <Button
            className="w-full"
            onClick={mode === "signin" ? handleSignIn : handleSignUp}
            disabled={pending || !email || !password}
          >
            {pending ? "Veuillez patienter..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-foreground"
                  onClick={() => setMode("signup")}
                >
                  Inscrivez-vous
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-foreground"
                  onClick={() => setMode("signin")}
                >
                  Connectez-vous
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
