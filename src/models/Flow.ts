import mongoose, { Schema, model, models } from "mongoose";

const FlowSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    title: { type: String, required: true },

    steps: [
      {
        type: {
          type: String,
          enum: ["text", "options", "input", "booking"],
          required: true,
        },
        message: { type: String },
        options: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

export default models.Flow || model("Flow", FlowSchema);
