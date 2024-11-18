import {cn} from "@/lib/utils";
import {User} from "lucide-react";
import Image from "next/image";
import React, {forwardRef} from "react";
import ReactMarkdown from "react-markdown";

const Message = forwardRef(({message}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-end",
        message.isUserMessage ? "justify-end" : ""
      )}
    >
      <div
        className={cn(
          "relative flex h-6 w-6 aspect-square items-center justify-center",
          message.isUserMessage ? "order-2 bg-blue-600 rounded-sm" : ""
        )}
      >
        {message.isUserMessage ? (
          <User className="fill-zinc-300 h-3/4 w-3/4" />
        ) : (
          <Image
            src="/star.svg"
            alt="star"
            width={16}
            height={16}
            className="h-3/4 w-3/4"
          />
        )}
      </div>
      <div
        className={cn(
          "flex flex-col space-y-2 text-base max-w-md mx-2",
          message.isUserMessage ? "order-1 items-end" : "order-2 items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-lg inline-block",
            message.isUserMessage
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          )}
        >
          {typeof message.text === "string" ? (
            <ReactMarkdown
              className={cn(
                "prose",
                message.isUserMessage ? "text-zinc-50" : ""
              )}
            >
              {message.text}
            </ReactMarkdown>
          ) : (
            message.text
          )}
        </div>
      </div>
    </div>
  );
});

Message.displayName = "Message";

export default Message;
