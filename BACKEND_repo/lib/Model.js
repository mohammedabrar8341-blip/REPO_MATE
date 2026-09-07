import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Please provide username "],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide email "],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password "],
    unique: true,
  },
});

const userModel = mongoose.models.users || mongoose.model("users", UserSchema);

export default userModel;
