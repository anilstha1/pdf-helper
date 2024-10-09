import {auth} from "@/auth";
import {prisma} from "@/lib/db";
import {NextResponse} from "next/server";

export async function DELETE(request) {
  const id = new URL(request.url).searchParams.get("id");

  const session = await auth();
  console.log(session);
  if (!session) {
    return {error: "User is not authenticated"};
  }

  try {
    await prisma.file.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "File Deleted Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
