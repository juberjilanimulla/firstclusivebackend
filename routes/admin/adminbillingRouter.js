import { Router } from "express";
import billingmodel from "../../models/billingmodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const adminbillingRouter = Router();

adminbillingRouter.post("/", getallbillingHandler);
adminbillingRouter.delete("/delete", deletebillingHandler);

export default adminbillingRouter;

async function getallbillingHandler(req, res) {
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
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
        { state: { $regex: searchRegex } },
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

    const bills = await billingmodel.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "services",
          localField: "serviceid",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: "$service",
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "billingid",
          as: "payment",
        },
      },
      {
        $unwind: {
          path: "$payment",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          mobile: { $first: "$mobile" },
          state: { $first: "$state" },
          createdAt: { $first: "$createdAt" },
          gstin: { $first: "$gstin" },
          gstname: { $first: "$gstname" },
          gstaddress: { $first: "$gstaddress" },
          gststate: { $first: "$gststate" },
          servicename: { $push: "$service.servicename" },
          servicecost: { $sum: "$service.servicecost" },
          gstcost: { $sum: "$service.gstcost" },
          totalamount: { $sum: "$service.totalcost" },
          discountamount: { $first: "$payment.discountamount" },
          finalamount: { $first: "$payment.finalamount" },
        },
      },
      { $sort: sortBy },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Fetch total count for pagination
    const totalCount = await billingmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Respond with data
    successResponse(res, "Success", { bills, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletebillingHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const billing = await billingmodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal servere error");
  }
}
