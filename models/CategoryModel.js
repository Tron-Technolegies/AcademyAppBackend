import mongoose, { model, Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    categoryName: {
      type: "String",
      required: true,
    },
    allCourses: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

const Category = model("Category", CategorySchema);

export default Category;
