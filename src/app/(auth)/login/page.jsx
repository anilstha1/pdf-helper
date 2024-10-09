"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Loader2} from "lucide-react";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import Link from "next/link";
import {useToast} from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function LoginPage() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const {toast} = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    console.log(values);
    setIsLoginLoading(true);

    try {
      const res = await signIn("credentials", {
        ...values,
        redirect: false,
      });
      console.log(res);
      if (res.error) {
        throw new Error(res.error);
      }

      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
      form.reset();
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error.message,
      });
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setIsGoogleLoading(true);
    await signIn("google", {callbackUrl: "/dashboard"});
    setIsGoogleLoading(false);
  }

  async function handleGithubAuth() {
    setIsGithubLoading(true);
    await signIn("github", {callbackUrl: "/dashboard"});
    setIsGithubLoading(false);
  }

  return (
    <MaxWidthWrapper className="mt-20">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="password"
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              type="submit"
              disabled={isLoginLoading || isGoogleLoading || isGithubLoading}
            >
              {isLoginLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : null}
              Login
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            type="button"
            disabled={isLoginLoading || isGoogleLoading || isGithubLoading}
            onClick={handleGoogleAuth}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Image
                src="/logo/google.png"
                alt="Google"
                width={20}
                height={20}
                className="h-8 w-8 mr-2"
              />
            )}
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isLoginLoading || isGoogleLoading || isGithubLoading}
            onClick={handleGithubAuth}
          >
            {isGithubLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Image
                src="/logo/github.png"
                alt="GitHub"
                width={20}
                height={20}
                className="h-6 w-6 mr-2"
              />
            )}
            GitHub
          </Button>
        </div>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {"Don't have an account? "}
          <Link href="/signup" className="underline">
            Register
          </Link>
        </p>
      </div>
    </MaxWidthWrapper>
  );
}
