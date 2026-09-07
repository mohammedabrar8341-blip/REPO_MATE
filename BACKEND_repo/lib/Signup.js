import bcryptjs from "bcryptjs";
import userModel from "./Model.js";
import { Connection } from "./db.js";

export async function Signup(req, res) {
  try {
    // Connect to database
    await Connection();

    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please provide username, email, and password",
        success: false,
      });
    }

    // Check if user already exists
    const foundUser = await userModel.findOne({ email });
    if (foundUser) {
      console.log("User already existed", foundUser);
      return res.status(400).json({
        message: "User already exists in database",
        success: false,
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log("User registered successfully:", newUser.email);

    return res.status(201).json({
      message: "Signup successful, user created in database",
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    const message = error?.message || "Error during signup";
    console.error("Signup failed:", message);

    return res.status(500).json({
      message: `Error during signup: ${message}`,
      success: false,
    });
  }
}

export default Signup;
