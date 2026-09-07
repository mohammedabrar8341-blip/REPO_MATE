import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "./Model.js";
import { Connection } from "./db.js";

export async function Signin(req, res) {
  try {
    // Connect to database
    await Connection();

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
        success: false,
      });
    }

    // Check if user exists
    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
      console.log("User not registered, attempting to login");
      return res.status(400).json({
        message: "User not registered. Please signup first",
        success: false,
      });
    }

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, foundUser.password);
    if (!isValidPassword) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Create JWT payload
    const payload = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_secret_key_here", {
      expiresIn: "7d",
    });

    console.log("User signed in successfully:", email);

    // Set cookie with token
    const response = res.status(200).json({
      message: "Signin successful",
      success: true,
      user: {
        id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
      },
      token,
    });

    return response;
  } catch (error) {
    const message = error?.message || "Error during signin";
    console.error("Signin failed:", message);

    return res.status(500).json({
      message: `Error during signin: ${message}`,
      success: false,
    });
  }
}

export default Signin;
