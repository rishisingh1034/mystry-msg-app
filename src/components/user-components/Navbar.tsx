"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "../ui/button";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const Navbar = () => {
  const { data: session } = useSession();

  const user: User = session?.user as User;

  const [isCreatingMessage, setIsCreatingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    router.push(`/u/${values.username}`);
    setIsCreatingMessage(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsCreatingMessage(false);
      }
    };

    if (isCreatingMessage) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreatingMessage]);

  const handleCreateMessageClick = () => {
    setIsCreatingMessage(true);
  };

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a className="text-xl font-bold mb-4 md:mb-0" href="#">
          Mystry Message
        </a>
        {session ? (
          <>
            <span className="mr-4">
              Welcome, {user?.username || user?.email}
            </span>
            <div className="flex">
              <div className="flex mr-5">
                {isCreatingMessage ? (
                  <div
                    className=" border-solid border-gray-100 border-2 rounded-md mr-5"
                    ref={inputRef}
                  >
                    {" "}
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className=" flex flex-row"
                      >
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="ml-2">
                          Submit
                        </Button>
                      </form>
                    </Form>
                  </div>
                ) : isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Button onClick={handleCreateMessageClick} className="mr-5">
                    Create Message
                  </Button>
                )}
                <Button className="w-full md:w-auto" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full md:w-auto">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
