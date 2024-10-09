"use client";
import {useUploadThing} from "@/lib/uploadthing";
import axios from "axios";
import {Upload, File, Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import Dropzone from "react-dropzone";

function UploadDropzone() {
  const [isLoading, setIsLoading] = useState(false);
  const isSubscribed = true;
  const router = useRouter();

  const uploadFile = async (data) => {
    try {
      const res = await axios.post("/api/file/addFile", data);
      console.log(res);

      router.push(`/dashboard/${res.data.file.id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const {startUpload} = useUploadThing("pdfUploader", {
    onClientUploadComplete: async (res) => {
      console.log("Files: ", res);

      await uploadFile({
        name: res[0].name,
        url: res[0].url,
        key: res[0].key,
      });
      setIsLoading(false);
    },
    onUploadError: (error) => {
      console.log("Error: ", error);
      setIsLoading(false);
    },
  });

  return (
    <div>
      <Dropzone
        multiple={false}
        accept={{
          "application/pdf": [],
        }}
        onDrop={async (file) => {
          setIsLoading(true);

          const res = await startUpload(file);
        }}
      >
        {({getRootProps, getInputProps, acceptedFiles}) => (
          <div
            {...getRootProps()}
            className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
          >
            <div className="flex items-center justify-center h-full w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-6 w-6 text-zinc-500 mb-2" />
                  <p className="mb-2 text-sm text-zinc-700">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-zinc-500">
                    PDF (up to {isSubscribed ? "16" : "4"}MB)
                  </p>
                </div>

                {acceptedFiles && acceptedFiles[0] ? (
                  <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                    <div className="px-3 py-2 h-full grid place-items-center">
                      <File className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="px-3 py-2 h-full text-sm truncate">
                      {acceptedFiles[0].name}
                    </div>
                  </div>
                ) : null}

                {isLoading && (
                  <div className="mt-4 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Uploading...
                  </div>
                )}
              </label>
              <input {...getInputProps()} />
            </div>
          </div>
        )}
      </Dropzone>
    </div>
  );
}

export default UploadDropzone;
