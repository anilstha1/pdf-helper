"use client";

import React from "react";
import {ChatContextProvider} from "./ChatContext";
import {useQuery} from "@tanstack/react-query";
import {ChevronLeft, Loader2, XCircle} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import {buttonVariants} from "./ui/button";
import ChatInput from "./ChatInput";
import Messages from "./Messages";

function ChatWrapper({fileId, isSubscribed}) {
  const {data, isLoading} = useQuery({
    queryKey: ["file", fileId],
    queryFn: async () => {
      const res = await axios.get(`/api/file/getFileStatus?id=${fileId}`);
      return res.data.file;
    },
    refetchInterval: (data) =>
      data.state.data?.uploadStatus === "SUCCESS" ||
      data.state.data?.uploadStatus === "FAILED"
        ? false
        : 500,
  });

  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  if (data?.uploadStatus === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  if (data?.uploadStatus === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in PDF</h3>
            <p className="text-zinc-500 text-sm">
              Your plan only supports PDFs with up to 4 pages.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between">
        <div className="flex-1 flex justify-between mb-[8.5rem]">
          <Messages fileId={fileId} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  );
}

export default ChatWrapper;
