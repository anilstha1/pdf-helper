import {createContext, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useToast} from "@/hooks/use-toast";
import axios from "axios";

export const ChatContext = createContext({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

export const ChatContextProvider = ({fileId, children}) => {
  const queryClient = useQueryClient();
  const {toast} = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {mutate: sendMessage} = useMutation({
    mutationFn: async ({message}) => {
      const res = await axios.post("/api/message/addMessage", {
        fileId,
        message,
      });
      return res.data;
    },
    onMutate: async ({message}) => {
      await queryClient.cancelQueries({queryKey: ["messages", fileId]});

      const previousMessages = queryClient.getQueryData(["messages", fileId]);

      queryClient.setQueryData(["messages", fileId], (oldData) => {
        const newMessage = {
          id: Math.random().toString(),
          text: message,
          isUserMessage: true,
          createdAt: new Date().toISOString(),
        };

        setMessage("");
        setIsLoading(true);

        return {
          ...oldData,
          pages: [
            {
              messages: [newMessage, ...oldData.pages[0].messages],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });

      return {
        previousMessages: previousMessages.pages.flatMap(
          (page) => page.messages
        ),
      };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["messages", fileId], context.previousMessages);
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Failed to send message",
      });
    },
    onSettled: () => {
      setIsLoading(false);
      queryClient.invalidateQueries(["messages", fileId]);
    },
  });

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = () => sendMessage({message});

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
