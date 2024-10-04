import dotenv from "dotenv";
import connectDB from "./db/connection.db.js";
import { app } from "./app.js";

dotenv.config({
  path: "../.env",
});

connectDB()
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`App is listening at port : ${port}`);
    });
  })
  .catch((error) => {
    console.log(`Database connection error : ${error}`);
    // process.exit(1);
  });
