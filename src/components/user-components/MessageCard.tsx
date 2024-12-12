"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Message } from "@/model/User";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Label } from "../ui/label";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();
  //console.log(message);
  const handleDeleteConfirm = async () => {
    const response = await axios.delete<ApiResponse>(
      `/api/delete-message/${message._id}`
    );
    toast({
      title: response.data.message,
    });
    onMessageDelete(message._id as string);
  };

  return (
    <Card className="w-[300px] mx-4 mt-4">
      <CardContent className="p-2 pl-4">
        <Label className="">Message</Label>
        <span className="block">{message.message}</span>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleDeleteConfirm}>Delete</Button>
      </CardFooter>
    </Card>
  );
};

export default MessageCard;
