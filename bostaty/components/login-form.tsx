"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "@/lib/static-store";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// DTO for login
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

type LoginDTO = z.infer<typeof loginSchema>;

const formFields = [
  { field: "Email", placeholder: "m@example.com", type: "email" },
  { field: "Password", placeholder: "••••••••", type: "password" },
];

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: LoginDTO) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.session) {
        const response = await fetch("/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supabase_access_token: authData.session.access_token,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get application token");
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      form.setError("root", {
        message: error.message || "Login failed",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {auth.signIn}
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
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
                name={item.field.toLowerCase() as keyof LoginDTO}
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
              {isSubmitting ? "Logging in..." : auth.signIn}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            {auth.signUp}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}