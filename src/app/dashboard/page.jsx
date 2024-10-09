"use client";

import React, {use, useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import UploadDropzone from "@/components/UploadDropzone";
import axios from "axios";
import {Loader2, MessageSquare, Plus, Trash} from "lucide-react";
import Link from "next/link";
import {formatDate} from "@/lib/utils";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {useToast} from "@/hooks/use-toast";

function DashboardPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState(null);

  const {toast} = useToast();

  const {
    data: files,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await axios.get("/api/file/getFiles");
      return res.data.files;
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const mutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/file/deleteFile?id=${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      toast({
        title: "File Deleted Successfully",
        description: "Your file has been deleted successfully.",
      });
      setCurrentlyDeletingFile(null);
      queryClient.invalidateQueries({queryKey: ["files"]});
    },
    onError: (error) => {
      console.log(error.message);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error.message,
      });
    },
  });

  const handleDelete = async ({id}) => {
    setCurrentlyDeletingFile(id);

    mutation.mutate(id);
  };

  return (
    <main className="mx-auto w-full max-w-7xl md:p-10">
      <div className="w-full mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>

        <div>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsOpen(open);
              }
            }}
          >
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
              <Button>Upload PDF</Button>
            </DialogTrigger>
            <DialogContent>
              <UploadDropzone />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        {isLoading && (
          <div>
            <Skeleton height={100} count={3} className="my-3" />
          </div>
        )}
        {files && files.length === 0 && (
          <div className="mt-5 text-center">You have no files</div>
        )}
        {files && files.length > 0 && (
          <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {formatDate(file.createdAt)}
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    mocked
                  </div>

                  <Button
                    onClick={() => handleDelete({id: file.id})}
                    size="sm"
                    className="w-full bg-red-100 hover:bg-red-200"
                    variant="destructive"
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4 text-red-600" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default DashboardPage;
