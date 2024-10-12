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
      subject: "Confirm Your Email Address for KnightShade IDE",

      text: `
      
      Hello!
      
      Welcome to KnightShade IDE! We're thrilled to have you on board. To complete your registration and get started, please verify your email address by clicking the link below:
      
      http://localhost:8000/api/v1/users/verify-email/${token} 
      
      This link will expire in 24 hours, so be sure to verify your email as soon as possible. If you did not create an account with us, please disregard this email.
      
      If you have any questions or need assistance, feel free to reach out to our support team at support@knightshade.ide.
      
      Thank you for choosing KnightShade IDE – your journey to seamless coding starts now!
      
      Best regards,  
      The KnightShade IDE Team
      
      Website: www.knightshade.me  
      Support: rony16@cse.pstu.ac.bd`,
    };

    await transporter.sendMail(mailConfigurations);
    return token;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      ReasonPhrases.BAD_REQUEST,
      error.error
    );
  }
};

export default sendVerificationEmail;
