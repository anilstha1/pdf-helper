import {auth} from "@/auth";
import {createUploadthing} from "uploadthing/next";
import {UploadThingError} from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  pdfUploader: f({pdf: {maxFileSize: "4MB"}})
    .middleware(async ({req}) => {
      const session = await auth();

      if (!session) throw new UploadThingError("Unauthorized");

      return {userId: session.user.id};
    })
    .onUploadComplete(async ({metadata, file}) => {
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      return {uploadedBy: metadata.userId};
    }),
};
