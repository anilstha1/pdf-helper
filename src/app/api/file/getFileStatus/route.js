import {auth} from "@/auth";
import {NextResponse} from "next/server";

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id");

  const session = await auth();
  console.log(session);
  if (!session) {
    return {error: "User is not authenticated"};
  }

  try {
    const file = await prisma.file.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });
    console.log(file);

    return NextResponse.json({
      message: "Files Fetched Successfully",
      success: true,
      file: file,
    });
  } catch (error) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
