import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import logomodel from "../../model/logomodel.js";

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
      return errorResponse(res, 400, "some params are missing");
    }
    const logo = await logomodel.findById(_id);
    if (!logo) {
      return errorResponse(res, 404, "logo id not found");
    } // Extract public_id from Cloudinary URL
    const imageUrl = logo.uploadimage;
    let publicId = null;

    if (imageUrl) {
      const match = imageUrl.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp)/);
      if (match) {
        publicId = match[1];
      }
    }

    // Delete blog from DB
    await logomodel.findByIdAndDelete(_id);

    // Delete image from Cloudinary
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary image deleted:", publicId);
      } catch (cloudErr) {
        // console.log("Cloudinary image deletion failed:", cloudErr.message);
      }
    }
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
