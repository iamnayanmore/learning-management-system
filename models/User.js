import mongoose, { Schema } from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: validator.isEmail,
    },
    phone: {
      type: Number,
      required: [true, "Please enter your phone"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password must be greater than 6 characters"],
      select: false,
    },
    subscription: {
      id: String,
      status: String,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    playlist: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "course",
        },
        poster: String,
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", schema);
