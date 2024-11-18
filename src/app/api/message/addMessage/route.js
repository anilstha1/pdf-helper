import {prisma} from "@/lib/db";
import {pc} from "@/lib/pinecone";
import {OpenAIEmbeddings} from "@langchain/openai";
import {PineconeStore} from "@langchain/pinecone";
import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {openai} from "@/lib/openai";

export async function POST(request) {
  try {
    const data = await request.json();
    const {fileId, message} = data;
    if (!fileId || !message) {
      return NextResponse.json(
        {error: "Missing fileId or message"},
        {status: 400}
      );
    }

    const session = await auth();
    console.log(session);
    if (!session) {
      return NextResponse.json(
        {error: "User is not authenticated"},
        {status: 401}
      );
    }

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId: session.user.id,
      },
    });
    if (!file)
      return NextResponse.json({error: "File not found"}, {status: 404});

    await prisma.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId: session.user.id,
        fileId,
      },
    });

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const pineconeIndex = pc.Index("pdf-helper");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await prisma.message.findMany({
      where: {
        fileId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? "user" : "assistant",
      content: msg.text,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
        },
        {
          role: "user",
          content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
      
        \n----------------\n

        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
          if (message.role === "user") return `User: ${message.content}\n`;
          return `Assistant: ${message.content}\n`;
        })}

        \n----------------\n

        CONTEXT:
        ${results.map((r) => r.pageContent).join("\n\n")}

        USER INPUT: ${message}`,
        },
      ],
    });

    const responseMessage = response.choices[0].message.content;
    // Save the complete message after response
    await prisma.message.create({
      data: {
        text: responseMessage,
        isUserMessage: false,
        userId: session.user.id,
        fileId,
      },
    });

    return NextResponse.json({message: responseMessage}, {status: 200});
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json({error: "Failed to add message"}, {status: 500});
  }
}
