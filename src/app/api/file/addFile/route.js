import {auth} from "@/auth";
import {prisma} from "@/lib/db";
import {NextResponse} from "next/server";

export async function POST(request) {
  const data = await request.json();
  const {name, url, key} = data;

  const session = await auth();
  console.log(session);
  if (!session) {
    return {error: "User is not authenticated"};
  }

  try {
    const newFile = await prisma.file.create({
      data: {
        name,
        url,
        key,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "File Created Successfully",
      success: true,
      file: newFile,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
