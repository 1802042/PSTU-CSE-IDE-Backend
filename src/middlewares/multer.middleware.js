import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, uniquePrefix + "-" + file.originalname);

    console.log(file.originalname, file.fieldname);
  },
});

export const upload = multer({
  storage,
});
