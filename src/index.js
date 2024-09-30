
import dotenv from "dotenv"
import connectDB from "./db/connection.db.js"

dotenv.config({
    path: "../.env"
})

connectDB();

