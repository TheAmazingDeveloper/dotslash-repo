import fs from "fs";
import { customAlphabet } from "nanoid";
import Admin from "../models/admin.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import ApiResponse from "../utils/response.js"; //76.8 75.5 74.4 73.2
import cloudinaryUploader from "../utils/cloudinaryUploader.js";

const options = {
  httpOnly: true,
  secure: true,
};

export const generateAccessAndRefereshToken = async (role, id) => {
  const user = await role.findById(id);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  return [accessToken, refreshToken];
};

export const registerUser = async (req, res) => {
  try {
    const filePath = req.file.path;
    const userDetails = {
      role:
        req.body.role == "admin"
          ? Admin
          : req.body.role == "doctor"
          ? Doctor
          : Patient,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      idInitial:
        req.body.role == "admin" ? "a" : req.body.role == "doctor" ? "d" : "p",
    };
    const userExists = await userDetails.role.exists({
      email: userDetails.email,
    });
    if (userExists)
      return res.json(
        new ApiResponse(false, null, `${req.body.role} already exists`)
      );
    const avatarUrl = await cloudinaryUploader(filePath);
    fs.unlinkSync(filePath);
    const nanoid = customAlphabet("123456789", 5);
    const createdId = `${userDetails.idInitial}${nanoid()}`;
    const createdUser = await userDetails.role.create({
      id: createdId,
      name: userDetails.name,
      email: userDetails.email,
      password: userDetails.password,
      avatarUrl: avatarUrl,
      refreshToken: "",
    });
    const [accessToken, refreshToken] = await generateAccessAndRefereshToken(
      userDetails.role,
      createdUser._id
    );

    const updatedUser = await userDetails.role
      .findByIdAndUpdate(
        createdUser._id,
        {
          refreshToken: refreshToken,
        },
        { returnDocument: "after" }
      )
      .select("-password -refreshToken");

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          true,
          { user: updatedUser },
          `${req.body.role} created successfully`
        )
      );
  } catch (error) {
    console.log(error);
    return res.json(new ApiResponse(false, null, error));
  }
};

export const loginUser = async (req, res) => {
  try {
    const userDetails = {
      role:
        req.body.role == "admin"
          ? Admin
          : req.body.role == "doctor"
          ? Doctor
          : Patient,
      id: req.body.id,
      password: req.body.password,
    };
    const userExists = await userDetails.role.find({ id: userDetails.id });
    if (!userExists.length) {
      return res.json(new ApiResponse(false, null, "User does not exists"));
    }
    const isPasswordCorrect = await userExists[0].comparePassword(
      userDetails.password
    );
    if (!isPasswordCorrect) {
      return res.json(new ApiResponse(false, null, "Password incorrect"));
    }
    const [accessToken, refreshToken] = await generateAccessAndRefereshToken(
      userDetails.role,
      userExists[0]._id
    );

    const updatedUser = await userDetails.role
      .findByIdAndUpdate(
        userExists[0]._id,
        {
          refreshToken: refreshToken,
        },
        { returnDocument: "after" }
      )
      .select("-password -refreshToken");

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          true,
          { user: updatedUser },
          "User retrieved successfully"
        )
      );
  } catch (error) {
    console.log(error);
    return res.json(new ApiResponse(false, null, error));
  }
};

export const logoutUser = async (req, res) => {
  return res.setCookie("accessToken", "").setCookie("refreshToken", "").send();
};
