import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter course title"],
      minLength: [4, "Title must be minimum 4 characters"],
      maxLength: [80, "Title can't exceed 80 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter course title"],
      minLength: [20, "Title must be minimum 20 characters"],
    },
    lectures: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        video: {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    poster: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    views: {
      type: Number,
      default: 0,
    },
    numOfVideos: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model("course", schema);
