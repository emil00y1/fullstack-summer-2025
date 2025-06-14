// components/AuthForm.jsx - Consolidate login/signup forms
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function AuthForm({ 
  type = "login", // "login" or "signup"
  schema, 
  onSubmit, 
  isLoading, 
  error 
}) {
  const isSignup = type === "signup";
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isSignup 
      ? { username: "", email: "", password: "" }
      : { email: "", password: "" }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSignup ? "Sign Up" : "Login"}</CardTitle>
        <CardDescription>
          {isSignup 
            ? "Enter your details to create your account"
            : "Enter your email below to login to your account"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {isSignup && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isLoading} />
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
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : (isSignup ? "Sign Up" : "Login")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}