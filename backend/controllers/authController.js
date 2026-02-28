const crypto = require("crypto");
const User = require("../models/user.model");
const userProfile=require("../models/userProfile.model");
const jwt = require("jsonwebtoken");

// ============================
// REGISTER CONTROLLER
// ============================
async function register(req, res, readJsonBody, sendJson) {
  console.log("hello--1");
  try {
    const body = await readJsonBody(req);
    console.log("hello");
    const email = (body.primaryEmail || "").trim().toLowerCase();
    const password = body.password || "";

    // validation
    if (!email|| !password) {
      return sendJson(res, 400, {
        message: "Email and password required",
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendJson(res, 400, {
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });
    console.log("New user id:",newUser._id);
    // create user profile
    const profile = await userProfile.create({
      userId: newUser._id,
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      primaryEmail: email,
      secondaryEmail: body.secondaryEmail || "",
      gender: body.gender || "",
      dob: body.dob || null,
      city: body.city || "",
      mobile: body.mobile || "",
      joinedDate: body.joinedDate || "",
      course: body.course || "",
      intake: body.intake || "",
      primaryLanguage: body.primaryLanguage || "",
      socialAccounts: body.socialAccounts || [],
      profilePic: body.profilePic || "",
    });
    console.log("new user profile: ", profile.userId);
    // return sendJson(res, 201, {
    //   message: "User registered successfully",
    //   user: {
    //     id: newUser._id,
    //     email: newUser.email,
    //     profile:profile,
    //   },
    // });
    // 🔥 ADD THIS PART
const token = jwt.sign(
  {
    id: newUser._id,
    email: newUser.email,
    role: newUser.role || "user",
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

return sendJson(res, 201, {
  message: "User registered successfully",
  token,
  user: {
    id: newUser._id,
    email: newUser.email,
    role: newUser.role || "user",
  },
});
  } catch (err) {
    console.error("Register Error:", err);
    return sendJson(res, 500, { message: "Server error" });
  }
}

// ============================
// LOGIN CONTROLLER
// ============================
async function login(req, res, readJsonBody, sendJson) {
  try {
    const body = await readJsonBody(req);

    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return sendJson(res, 400, {
        message: "Email and password required",
      });
    }

    // ======================
    // ADMIN LOGIN
    // ======================
    if (email === "admin@mdh.com" && password === "admin123") {
      const token = jwt.sign(
        {
          id: "admin-id",
          email: email,
          role: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return sendJson(res, 200, {
        token,
        user: {
          id: "admin-id",
          email,
          role: "admin",
        },
      });
    }

    // ======================
    // NORMAL USER LOGIN
    // ======================
    const user = await User.findOne({ email });

    if (!user) {
      return sendJson(res, 401, {
        message: "Invalid email or password",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.password !== hashedPassword) {
      return sendJson(res, 401, {
        message: "Invalid email or password",
      });
    }

    // ✅ REAL JWT TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return sendJson(res, 200, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return sendJson(res, 500, { message: "Server error" });
  }
}

module.exports = {
  register,
  login,
};