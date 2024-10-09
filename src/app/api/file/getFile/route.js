import {auth} from "@/auth";
import {connect} from "@/dbConfig/dbConfig";
import File from "@/models/fileModel";
import {NextResponse} from "next/server";

connect();

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id");

  const session = await auth();
  console.log(session);
  if (!session) {
    return {error: "User is not authenticated"};
  }

  try {
    const file = await File.findOne({user: session.user.id, _id: id});
    console.log(file);

    return NextResponse.json({
      message: "Files Fetched Successfully",
      success: true,
      files: file,
    });
  } catch (error) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
