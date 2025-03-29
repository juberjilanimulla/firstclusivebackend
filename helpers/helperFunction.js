import careermodel from "../models/careermodel.js";
import { errorResponse } from "./serverResponse.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt, { compare } from "bcrypt";
import axios from "axios";
import config from "../config.js";
import crypto from "crypto";
import usermodel from "../models/usermodel.js";

const secrectKey = crypto.randomBytes(48).toString("hex");

export function generateAccessToken(id, email, role) {
  const sessionid = createSession(id);
  const encoded_tokenPayload = {
    id,
    email,
    role,
  };
  const public_tokenPayload = {
    id,
    email,
    role,
    sessionid,
  };
  const encoded_token = jwt.sign(encoded_tokenPayload, secrectKey, {
    expiresIn: "2h",
  });
  const public_token = jwt.sign(public_tokenPayload, secrectKey, {
    expiresIn: "1d",
  });
  return { encoded_token, public_token };
}

export function validatetoken(token) {
  try {
    // console.log("tok", token);
    return jwt.verify(token, secrectKey);
  } catch (error) {
    throw error;
  }
}

export async function isAdminMiddleware(req, res, next) {
  const isAdmin = res.locals.role;
  // console.log("isAdmin", isAdmin);
  if (!isAdmin || isAdmin !== "admin") {
    errorResponse(res, 403, "user not authorized");
    return;
  }
  next();
}

// auth middleware
/**
 *
 * @param {import("express").Request} req
 * @param {Response} res
 * @param {import("express").Nextexport function} next
 */
export function authMiddleware(req, res, next) {
  const authHeader =
    req.headers.Authorization || req.headers.authorization || req.query.token;

  if (!authHeader) {
    errorResponse(res, 401, "token not found");
    return;
  }
  const encoded_token = authHeader.split(" ")[1];

  if (!encoded_token) return res.status(401).json("Unauthorize user");

  try {
    const decoded = jwt.verify(encoded_token, secrectKey);

    if (!decoded.role || !decoded.email) {
      console.log("Not authorized");
      return res.status(401).json("Unauthorize user");
    }

    res.locals["id"] = decoded.id;
    res.locals["role"] = decoded.role;
    res.locals["email"] = decoded.email;

    next();
  } catch (error) {
    console.log(error.message);
    errorResponse(res, 401, "user not authorized");
  }
}

//hash pass
export function bcryptPassword(password) {
  return bcrypt.hashSync(password, 10);
}

//compare pass
export function comparePassword(password, hashedpassword) {
  return bcrypt.compareSync(password, hashedpassword);
}

//sessions...
let sessions = new Map();
/**
 *
 * @param {Object} data
 * @returns
 */
export function createSession(id) {
  const sessionId = uuidv4();
  sessions.set(id, sessionId);
  return sessionId;
}

export function getSessionData(id) {
  return sessions.has(id) ? sessions.get(id) : null;
}

export function deleteSession(id) {
  return sessions.has(id) ? sessions.delete(id) : false;
}

export async function Admin() {
  const adminstr = process.env.ADMIN;
  const admins = adminstr.split(",");

  for (const email of admins) {
    const exist = await usermodel.findOne({ email });
    if (!exist) {
      await usermodel.create({
        firstname: "admin",
        lastname: "admin",
        email: email,
        role: "admin",
        mobile: 9966470788,
        password: bcryptPassword("1234"),
      });
    } else {
      console.log("admin already exist");
    }
  }
}

export async function GetJobidNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `${year}${month}`;

  // Find the highest serial number for the current month
  const lastproduct = await careermodel
    .findOne({
      jobid: new RegExp(`^${prefix}`),
    })
    .sort({ jobid: -1 })
    .exec();

  let serialNumber = "0001";
  if (lastproduct) {
    const lastSerial = parseInt(lastproduct.jobid.slice(-4), 10);
    serialNumber = String(lastSerial + 1).padStart(4, "0");
  }

  return `${prefix}${serialNumber}`;
}

const otpRequestStore = {};

//  Function to check rate limit for OTP requests
// export async function checkRateLimit(email) {
//   const windowMs = 15 * 60 * 1000; // 15 minutes in milliseconds
//   const maxRequests = 5;
//   const now = Date.now();

//   // Initialize request count for the mobile number if not exists
//   if (!otpRequestStore[email]) {
//     otpRequestStore[email] = [];
//   }

//   // Clean up old entries from the store
//   otpRequestStore[email] = otpRequestStore[email].filter((entry) => {
//     return entry.timestamp + windowMs > now;
//   });

//   // Check request count
//   if (otpRequestStore[email].length >= maxRequests) {
//     return false; // Rate limit exceeded
//   }

//   // Add current request to the store
//   otpRequestStore[email].push({ timestamp: now });

//   return true; // Within rate limit
// }

export default async function getnumber(id) {
  // console.log(id);
  return id;
}
