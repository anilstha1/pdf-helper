import {NextResponse} from "next/server";
import bcryptjs from "bcryptjs";
import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

connect();

export async function POST(request) {
  try {
    const data = await request.json();
    const {name, email, password} = data;

    const user = await User.findOne({email});

    if (user) {
      return NextResponse.json({error: "User already exists"}, {status: 400});
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: "User Created Successfully",
      success: true,
      user: userResponse,
    });
  } catch (error) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
