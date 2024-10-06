import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

dotenv.config({
  path: "../../.env",
});

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendVerificationEmail = async (email) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USERNAME,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const token = jwt.sign({ email }, process.env.EMAIL_JWT_SECRET, {
      expiresIn: "10m",
    });

    const mailConfigurations = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Email Verification",
      text: `
      hello,
      You are receiving this email because you have created an account on Knightshade Online Judge.

      Please follow the given link to verify your email 
      http://localhost:8000/api/v1/users/verify-email/${token} 
  
      Knightshade Online Judge`,
      // html: "<b>This is a test email using Nodemailer.</b>",
    };

    await transporter.sendMail(mailConfigurations);
    return token;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error
    );
  }
};

export default sendVerificationEmail;
