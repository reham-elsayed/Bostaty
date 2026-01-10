"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "@/lib/static-store";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

// Schema for both login and signup (simplified without repeat password)
const authSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthDTO = z.infer<typeof authSchema>;

const formFields = [
  { field: "Email", placeholder: "m@example.com", type: "email" },
  { field: "Password", placeholder: "••••••••", type: "password" },
];

export function LoginForm({ searchParams }: { searchParams: { next?: string } }) {

  const router = useRouter();
  const supabase = createClient();
  const [isSignUp, setIsSignUp] = useState(false);
  const next = searchParams?.next

  let inviteToken: string | null = null

  if (next) {
    try {
      const url = new URL(next, 'http://localhost')
      inviteToken = url.searchParams.get('token')
    } catch {
      inviteToken = null
    }
  }
  const form = useForm<AuthDTO>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: AuthDTO) => {
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/callback`
          },
        });


        if (error) {
          console.log("AUTH ERROR:", error)
          throw error;
        }
        const successUrl = new URL(`${window.location.origin}/sign-up-success`);
        if (next) {
          successUrl.searchParams.set("next", next);
        }
        router.push(successUrl.toString());

        return;
      } else {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        // const response = await fetch("/token", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     supabase_access_token: authData.session.access_token,
        //   }),
        // });

        // if (!response.ok) {
        //   const errorData = await response.json();
        //   if (errorData.error === "Tenant not assigned") {
        //     const onboardingUrl = next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding";
        //     router.push(onboardingUrl);
        //     return;
        //   }
        //   throw new Error(errorData.error || "Failed to get application token");
        // }

        router.refresh();
        if (next) {
          router.push(next)
        } else {
          router.push("/dashboard");
        }
      }
    }
    catch (error: any) {
      form.setError("root", {
        message: error.message || (isSignUp ? "Sign up failed" : "Login failed"),
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {isSignUp ? "Create Account" : auth.signIn}
        </CardTitle>
        <CardDescription className="text-center">
          {isSignUp
            ? "Enter your details to create an account"
            : "Enter your credentials to access your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {formFields.map((item) => (
              <FormField
                key={item.field}
                control={form.control}
                name={item.field.toLowerCase() as keyof AuthDTO}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{item.field}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={item.placeholder}
                        type={item.type}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive text-center">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? isSignUp
                  ? "Creating account..."
                  : "Logging in..."
                : isSignUp
                  ? "Create Account"
                  : auth.signIn}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-medium text-primary hover:underline"
              >
                {auth.signIn}
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-medium text-primary hover:underline"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}