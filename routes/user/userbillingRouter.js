import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import billingmodel from "../../models/billingmodel.js";

const userbillingRouter = Router();

userbillingRouter.post("/create", createbillingHandler);

export default userbillingRouter;

async function createbillingHandler(req, res) {
  try {
    const {
      serviceid,
      name,
      email,
      mobile,
      state,
      gstname,
      gstin,
      gstaddress,
      gststate,
      termsandconditions,
    } = req.body;
    if (
      !serviceid ||
      !name ||
      !email ||
      !mobile ||
      !state ||
      !termsandconditions
    ) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = {
      serviceid,
      name,
      email,
      mobile,
      state,
      gstin,
      gstname,
      gstaddress,
      gststate,
      termsandconditions,
    };
    const billing = await billingmodel.create(params);
    successResponse(res, "success", billing);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

// import { Router } from "express";
// import {
//   errorResponse,
//   successResponse,
// } from "../../helpers/serverResponse.js";
// import billingmodel from "../../models/billingmodel.js";
// import servicemodel from "../../models/servicesmodel.js";

// const userbillingRouter = Router();

// userbillingRouter.post("/create", createbillingHandler);

// export default userbillingRouter;

// async function createbillingHandler(req, res) {
//   try {
//     let {
//       serviceid,
//       name,
//       email,
//       mobile,
//       state,
//       gstname,
//       gstin,
//       gstaddress,
//       gststate,
//     } = req.body;
//     if (!serviceid || !name || !email || !mobile || !state) {
//       return errorResponse(res, 400, "some params are missing");
//     }

//     const serviceIds = Array.isArray(serviceid) ? serviceid : [serviceid];

//     const services = await Promise.all(
//       serviceIds.map((id) => servicemodel.findById(id))
//     );

//     const validServices = services.filter((s) => s);

//     if (validServices.length === 0) {
//       return errorResponse(res, 400, "Invalid service(s) selected ");
//     }

//     const totalServiceCost = validServices.reduce(
//       (sum, s) => sum + s.servicecost,
//       0
//     );
//     const totalGst = validServices.reduce((sum, s) => sum + s.gstcost, 0);
//     const totalAmount = validServices.reduce(
//       (sum, s) => sum + s.totalamount,
//       0
//     );

//     const params = {
//       serviceid: validServices.map((s) => s._id),
//       name,
//       email,
//       mobile,
//       state,
//       gstin,
//       gstname,
//       gstaddress,
//       gststate,
//     };
//     const billing = await billingmodel.create(params);
//     successResponse(res, "Billing created successfully", {
//       billing,
//       totals: {
//         servicecost: totalServiceCost,
//         gst: totalGst,
//         total: totalAmount,
//       },
//       services: validServices.map((s) => ({
//         name: s.servicename,
//         cost: s.servicecost,
//         gst: s.gstcost,
//         total: s.totalamount,
//       })),
//     });
//   } catch (error) {
//     console.log("error", error);
//     errorResponse(res, 500, "internal server error");
//   }
// }
