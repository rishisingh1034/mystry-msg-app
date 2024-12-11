"use client";

import { useState, useEffect, useCallback, use } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const FormSchema = z.object({
    anonymousMessage: z
        .string()
        .min(10, {
            message: "Message must be at least 10 characters.",
        })
        .max(160, {
            message: "Message must not be longer than 160 characters.",
        }),
});

type PageProps = {
    params: Promise<{
        username: string;
    }>;
};

const Page = ({ params }: PageProps) => {
    const resolvedParams = use(params);
    const { username } = resolvedParams;
    //console.log(username);
    const { toast } = useToast();
    const [isUserAcceptingMessages, setIsUserAcceptingMessages] = useState(false);
    const [userFound, setUserFound] = useState(true);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            anonymousMessage: "",
        },
    });

    // Fetch user status on component mount
    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const isUser = await axios.get<ApiResponse>(
                    `/api/user-availability?username=${username}`
                );

                if (isUser.data.success) {
                    setIsUserAcceptingMessages(
                        isUser.data.isAcceptingMessages as boolean
                    );
                } else {
                    setUserFound(false);
                }
            } catch (error) {
                console.log(error)
                setUserFound(false);
            }
        };

        checkUserStatus();
    }, [username]);

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            // Check user status before submitting
            const userStatusCheck = await axios.get<ApiResponse>(
                `/api/user-availability?username=${username}`
            );

            if (!userStatusCheck.data.isAcceptingMessages) {
                toast({
                    title: "Cannot send message",
                    description: "This user is not accepting messages",
                    variant: "destructive",
                });
                return;
            }

            const content = data.anonymousMessage;
            const response = await axios.post<ApiResponse>(`/api/send-message`, {
                content,
                username,
            });

            if (response.data.success) {
                toast({
                    title: "Message Sent",
                    description: response.data.message,
                });
                form.reset();
            } else {
                toast({
                    title: "Failed to save message",
                    description: response.data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error submitting message:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        }
    }

    function handlePromptClick(event: React.MouseEvent<HTMLSpanElement>) {
        event.preventDefault();
        const text = event.currentTarget.textContent ?? "";
        form.reset({
            anonymousMessage: text,
        });
        return;
    }

    const [geminiResponseArray, setGeminiResponseArray] = useState<string[]>([]);

    const handleSuggestMessages = useCallback(async () => {
        try {
            const geminiResponse = await axios.post<ApiResponse>(
                `/api/suggest-messages`
            );
            console.log(geminiResponse)
            const responseData = geminiResponse.data.message;
            const responses = responseData.split("||");
            setGeminiResponseArray(responses);
            return;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to fetch suggested messages:", error.response?.data);
            } else {
                console.error("Failed to fetch suggested messages:", error);
            }
        }
    }, []);

    useEffect(() => {
        handleSuggestMessages();
    }, [handleSuggestMessages]);

    if (!userFound) {
        return (
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>User not found</AlertDescription>
            </Alert>
        );
    }

    if (!isUserAcceptingMessages) {
        return (
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>User is not accepting messages</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="my-8">
            <div className="w-full max-w-screen-xl mx-auto px-4">
                <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-1"></div>
                    <div className="col-span-4">
                        <div className="font-bold text-4xl mb-6 text-center">
                            Public Profile Link
                        </div>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="w-auto space-y-6 mx-auto"
                            >
                                <FormField
                                    control={form.control}
                                    name="anonymousMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Send anonymous message to @{username}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Write your anonymous message here"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="flex mx-auto">
                                    Submit
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-20">
                            <Button className="block mb-4" onClick={handleSuggestMessages}>
                                Suggest Messages
                            </Button>
                            <span className="block mb-4">
                                Click on any messages below to select it
                            </span>
                            <div className="border-solid border-gray border-2 rounded-md p-4">
                                <span className="font-medium text-xl mb-8">Suggestions</span>
                                {geminiResponseArray.map((response, index) => {
                                    return (
                                        <span
                                            className="block mb-2 border-solid border-gray text-center border-2 rounded-md p-2 hover:bg-gray-100"
                                            key={`${response}+${index}`}
                                            onClick={handlePromptClick}
                                        >
                                            {response}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1"></div>
                </div>
            </div>
        </div>
    );
};

export default Page;