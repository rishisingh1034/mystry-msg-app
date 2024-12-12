"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState<string>(""); // Ensure it's a string initially
  const fullText = "Send Anonymous Messages"; // Full text for animation

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // Typing effect useEffect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex)); // Use slice instead of concatenation
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    router.push(`/u/${values.username}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <header className="w-full px-4 py-4 border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mystry Message</h1>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Typing Effect */}
        <h1 className="text-4xl font-bold mb-4">
          {displayText}
          <span className="animate-pulse">|</span> {/* The typing cursor */}
        </h1>

        <p className="text-gray-600 mb-6">
          Post anonymous questions or messages to your friends and get their
          responses.
        </p>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="my-4">
                Submit
              </Button>
            </form>
          </Form>
        )}
      </main>

      <footer className="w-full py-4 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Mystry Message. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
