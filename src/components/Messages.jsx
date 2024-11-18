"use client";
import {useInfiniteQuery} from "@tanstack/react-query";
import {Loader2, MessageSquare} from "lucide-react";
import React, {useContext, useEffect, useRef} from "react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import {useIntersection} from "@mantine/hooks";
import axios from "axios";
import {ChatContext} from "./ChatContext";
import {useToast} from "@/hooks/use-toast";

function Messages({fileId}) {
  const {toast} = useToast();
  const {isLoading: isAiThinking} = useContext(ChatContext);

  const {data, isLoading, fetchNextPage} = useInfiniteQuery({
    queryKey: ["messages", fileId],
    queryFn: async ({pageParam = null}) => {
      const res = await axios.get("/api/message/getMessages", {
        params: {
          fileId,
          limit: 5,
          cursor: pageParam,
        },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    keepPreviousData: true,
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch messages",
      });
    },
  });

  const messages = data?.pages.flatMap((page) => page.messages);

  const loadingMessage = {
    id: "loading-message",
    isUserMessage: false,
    text: (
      <span className="w-[25rem] max-w-md flex items-center justify-center">
        <Skeleton className="h-6 w-full" />
      </span>
    ),
    createdAt: new Date().toISOString(),
  };

  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  const lastMessageRef = useRef(null);

  const {ref, entry} = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <div className="flex max-h-[calc(100vh-200px)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto">
      {combinedMessages && combinedMessages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
      {combinedMessages &&
        combinedMessages.length > 0 &&
        combinedMessages.map((message, i) => {
          return i === combinedMessages.length - 1 ? (
            <Message ref={ref} message={message} key={message.id} />
          ) : (
            <Message message={message} key={message.id} />
          );
        })}
      {isLoading && (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}
    </div>
  );
}

export default Messages;
