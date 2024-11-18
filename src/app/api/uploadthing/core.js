import {auth} from "@/auth";
import {prisma} from "@/lib/db";
import {createUploadthing} from "uploadthing/next";
import {UploadThingError} from "uploadthing/server";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {OpenAIEmbeddings} from "@langchain/openai";
import {PineconeStore} from "@langchain/pinecone";
import {pc} from "@/lib/pinecone";

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
      const createdFile = await prisma.file.create({
        data: {
          name: file.name,
          url: file.url,
          key: file.key,
          userId: metadata.userId,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        const res = await fetch(file.url);
        const blob = await res.blob();
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();

        const pagesAmt = pageLevelDocs.length;

        const pineconeIndex = pc.Index("pdf-helper");

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });

        await prisma.file.update({
          where: {
            id: createdFile.id,
          },
          data: {
            uploadStatus: "SUCCESS",
          },
        });
      } catch (error) {
        console.log(error);
        await prisma.file.update({
          where: {
            id: createdFile.id,
          },
          data: {
            uploadStatus: "FAILED",
          },
        });
      }
    }),
};
