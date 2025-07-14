import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import paymentmodel from "../../models/paymentmodel.js";

const adminpaymentRouter = Router();

adminpaymentRouter.post("/", getallpaymentHandler);
adminpaymentRouter.delete("/delete", deletepaymentHandler);

export default adminpaymentRouter;

async function getallpaymentHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;

    const limit = 10; // Number of items per page
    const skip = pageno * limit;

    // Base query for job applicants
    let query = {
      $and: [],
    };

    // Apply filters
    if (filterBy) {
      Object.keys(filterBy).forEach((key) => {
        if (filterBy[key] !== undefined) {
          query.$and.push({ [key]: filterBy[key] });
        }
      });
    }

    // Apply search
    if (search.trim()) {
      // const searchRegex = new RegExp(search.trim(), "i");
      const searchRegex = new RegExp("\\b" + search.trim(), "i");
      const searchConditions = [
        { "billing.name": { $regex: searchRegex } },
        { "billing.email": { $regex: searchRegex } },
        { "billing.mobile": { $regex: searchRegex } },
        { "service.servicename": { $regex: searchRegex } },
        { "service.servicecost": { $regex: searchRegex } },
        { "service.gstcost": { $regex: searchRegex } },
        { "service.totalamount": { $regex: searchRegex } },
      ];
      query.$and.push({ $or: searchConditions });
    }

    // If no filters or search applied, use an empty object for the query
    if (query.$and.length === 0) {
      query = {};
    }

    // Apply sorting
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 }; // Default sorting by most recent billing

    const payment = await paymentmodel.aggregate([
      {
        $lookup: {
          from: "bills",
          localField: "billingid",
          foreignField: "_id",
          as: "billing",
        },
      },
      {
        $unwind: "$billing",
      },
      {
        $lookup: {
          from: "services",
          localField: "billing.serviceid",
          foreignField: "_id",
          as: "service",
        },
      },
    
      {
        $match: query,
      },
      {
        $project: {
          method: 1,
          status: 1,
          createdAt: 1,
          name: "$billing.name",
          email: "$billing.email",
          mobile: "$billing.mobile",
          services: {
            $map: {
              input: "$service",
              as: "s",
              in: {
                servicename: "$$s.servicename",
                servicecost: "$$s.servicecost",
                gstcost: "$$s.gstcost",
                totalamount: "$$s.totalamount",
              },
            },
          },
        },
      },
      { $sort: sortBy },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Fetch total count for pagination
    const totalCount = await paymentmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Respond with data
    successResponse(res, "Success", { payment, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletepaymentHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const payment = await paymentmodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
