import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const PatientSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    avatarUrl: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    medicalHistory: [
      {
        date: { type: Date, required: true },
        diagnosis: { type: String, required: true },
        treatment: { type: String, required: true },
        doctorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor",
          required: true,
        },
        notes: { type: String },
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

PatientSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compareSync(password, this.password);
  return result;
};

PatientSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

PatientSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

PatientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

const Patient = mongoose.model("patient", PatientSchema);
export default Patient;
