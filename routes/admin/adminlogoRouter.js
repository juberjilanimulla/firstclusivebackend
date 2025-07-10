import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import logomodel from "../../models/logomodel.js";
import { v2 as cloudinary } from "cloudinary";

const adminlogoRouter = Router();

adminlogoRouter.post("/", getalllogoHandler);
adminlogoRouter.delete("/delete", deletelogoHandler);

export default adminlogoRouter;

async function getalllogoHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = {};

    // Apply search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { companyname: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
      ];
    }

    // Apply filters
    if (filterBy && Object.keys(filterBy).length > 0) {
      query = {
        ...query,
        ...filterBy,
      };
    }

    // Sorting logic
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 };

    // Fetch paginated businesscard
    const logo = await logomodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalCount = await logomodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "successfully", {
      logo,
      totalPages,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletelogoHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "Missing logo ID");
    }

    const logo = await logomodel.findById(_id);
    if (!logo) {
      return errorResponse(res, 404, "Logo not found");
    }

   
    const imageUrls = Array.isArray(logo.uploadimage) ? logo.uploadimage : [];

    // Extract full public_id (including folder) directly from the URL
    const publicIds = imageUrls
      .map((url) => {
        const match = url.match(
          /upload\/(?:v\d+\/)?(.+?)\.(jpg|jpeg|png|gif|webp)/
        );
        return match ? match[1] : null;
      })
      .filter(Boolean); // remove nulls

    // Delete each image from Cloudinary
    if (publicIds.length > 0) {
      for (const publicId of publicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to delete from Cloudinary:", publicId, err.message);
        }
      }
    } else {
      console.log("No images to delete in Cloudinary.");
    }

    // Delete logo document from DB
    await logomodel.findByIdAndDelete(_id);

    return successResponse(res, "Successfully deleted logo and all images");
  } catch (error) {
    console.error(" Delete error:", error.message);
    return errorResponse(res, 500, "Internal server error");
  }
}
