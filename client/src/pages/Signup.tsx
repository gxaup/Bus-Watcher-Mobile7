import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { UserPlus, Eye, EyeOff } from "lucide-react";

const signupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await signup(data.username, data.password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col p-4 safe-area-bottom safe-area-top">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-extrabold font-display text-foreground">
              Create Account
            </h1>
            <p className="text-base text-muted-foreground">
              Join Full Loop Report
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Choose a username"
                        className="h-12 text-base"
                        autoComplete="username"
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Choose a password"
                          className="h-12 text-base pr-12"
                          autoComplete="new-password"
                          data-testid="input-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90"
                disabled={isSubmitting}
                data-testid="button-signup"
              >
                {isSubmitting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
