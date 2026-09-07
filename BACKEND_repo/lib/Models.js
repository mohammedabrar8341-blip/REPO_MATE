import mongoose from "mongoose";
import { Schema } from "mongoose";

// User Schema
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true }
);

// Repository Schema
const RepositorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    githubURL: {
      type: String,
      required: true,
    },
    repositoryName: {
      type: String,
      required: true,
    },
    indexedFiles: [
      {
        fileName: String,
        sourceCode: String,
        summary: String,
        embeding: [Number],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.users || mongoose.model("users", UserSchema);
const repositoryModel = mongoose.models.repositories || mongoose.model("repositories", RepositorySchema);

export { userModel, repositoryModel };
export default userModel;
