import { Router } from "express";
import { successResponse,errorResponse } from "../../helpers/serverResponse.js";
import contactmodel from "../../models/contactmodel.js";
import notificationmodel from "../../models/notificationmodel.js";

const contactRouter = Router();

contactRouter.post("/create", createContactHandler);

export default contactRouter;

export async function createContactHandler(req, res) {
    try {
      const { name, companyName, mobile, email, subject, message } = req.body;
  
      if (!name || !companyName || !mobile || !email || !subject || !message) {
        return errorResponse(res, 400, "Some required fields are missing.");
      }
  
      // Save Contact Entry
      const contactEntry = await contactmodel.create({
        name,
        companyName,
        mobile,
        email,
        subject,
        message,
      });
  
      // Construct Notification Message (Including User Name & Message)
      const notificationMessage = `${contactEntry.name} filled the contact form with the message: "${contactEntry.message}"`;
  
      // Create Notification
      await createNotification(notificationMessage);
  
      return successResponse(res, "Successfully submitted contact form.", contactEntry);
    } catch (error) {
      console.error("Error in createContactHandler:", error);
      return errorResponse(res, 500, "Internal Server Error");
    }
  }
  
  // Function to Create Notification
  export async function createNotification(message) {
    try {
      await notificationmodel.create({
        message,
      });
    } catch (error) {
      console.error("Error creating notification:", error.message);
      throw new Error("Failed to create notification");
    }
  }

  