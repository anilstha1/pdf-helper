import {NextResponse} from "next/server";
import bcryptjs from "bcryptjs";
import {prisma} from "@/lib/db";

export async function POST(request) {
  try {
    const data = await request.json();
    const {name, email, password} = data;
    if (!name || !email || !password) {
      return NextResponse.json(
        {error: "Please fill all the fields"},
        {status: 400}
      );
    }

    const user = await prisma.user.findUnique({where: {email}});

    if (user) {
      return NextResponse.json({error: "User already exists"}, {status: 400});
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const {password: _, ...userResponse} = newUser;

    return NextResponse.json({
      message: "User Created Successfully",
      success: true,
      user: userResponse,
    });
  } catch (error) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
