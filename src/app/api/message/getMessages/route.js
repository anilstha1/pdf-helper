import {auth} from "@/auth";
import {NextResponse} from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const fileId = url.searchParams.get("fileId");
  const limit = url.searchParams.get("limit");
  const cursor = url.searchParams.get("cursor");

  const session = await auth();
  console.log(session);
  if (!session) {
    return {error: "User is not authenticated"};
  }

  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId: session.user.id,
      },
    });
    console.log(file);
    if (!file)
      return NextResponse.json({error: "File not found"}, {status: 404});

    const messages = await prisma.message.findMany({
      where: {
        fileId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Number(limit) + 1,
      cursor: cursor ? {id: cursor} : undefined,
      select: {
        id: true,
        text: true,
        isUserMessage: true,
        createdAt: true,
      },
    });

    let nextCursor;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem.id;
    }

    return NextResponse.json({
      message: "Files Fetched Successfully",
      success: true,
      messages,
      nextCursor,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
