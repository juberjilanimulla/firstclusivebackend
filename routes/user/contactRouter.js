import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import contactmodel from "../../models/contactmodel.js";
const contactRouter = Router();

contactRouter.post("/create", createContactHandler);

export default contactRouter;

async function createContactHandler(req, res) {
  try {
    const { name, companyname, mobile, email, subject, message } = req.body;

    if (!name || !companyname || !mobile || !email || !subject || !message) {
      return errorResponse(res, 400, "Some required fields are missing.");
    }

    // Save Contact Entry
    const contactEntry = await contactmodel.create({
      name,
      companyname,
      mobile,
      email,
      subject,
      message,
    });

    return successResponse(
      res,
      "Successfully submitted contact form.",
      contactEntry
    );
  } catch (error) {
    console.error("Error in createContactHandler:", error);
    return errorResponse(res, 500, "Internal Server Error");
  }
}
