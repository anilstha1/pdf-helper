import {auth} from "@/auth";
import {prisma} from "@/lib/db";
import {NextResponse} from "next/server";

export async function GET() {
  const session = await auth();
  console.log(session);
  if (!session) {
    return {error: "User is not authenticated"};
  }

  try {
    const files = await prisma.file.findMany({
      where: {userId: session.user.id},
    });
    console.log(files);

    return NextResponse.json({
      message: "Files Fetched Successfully",
      success: true,
      files: files,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
