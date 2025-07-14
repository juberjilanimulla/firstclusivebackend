import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import jobpostingmodel from "../../models/jobpostingmodel.js";
const adminjobpostingRouter = Router();

adminjobpostingRouter.post("/create", createjobpostingHandler);
adminjobpostingRouter.get("/", getalljobpostingHandler);
adminjobpostingRouter.post("/update", updatejobpostingHandler);
adminjobpostingRouter.post("/delete", deletejobpostingHandler);
adminjobpostingRouter.get("/single", getsinglejobpostingHandler);
adminjobpostingRouter.post("/published/:id", publishedjobpostingHandler);

export default adminjobpostingRouter;

async function getalljobpostingHandler(req, res) {
  try {
    const job = await jobpostingmodel.find();
    if (!job) {
      return errorResponse(res, 404, "job not found");
    }
    successResponse(res, "success", job);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

// async function createjobpostingHandler(req, res) {
//   try {
//     const {
//       jobtitle,
//       description,
//       location,
//       companydescription,
//       roledescription,
//       qualifications,
//       bonusskills,
//     } = req.body;
//     if (
//       !jobtitle ||
//       !description ||
//       !location ||
//       !companydescription ||
//       !roledescription ||
//       !qualifications ||
//       !bonusskills
//     ) {
//       return errorResponse(res, 400, "some params are missing");
//     }
//     const params = {
//       jobtitle,
//       description,
//       location,
//       companydescription,
//       roledescription,
//       qualifications,
//       bonusskills,
//     };
//     const careerjob = await jobpostingmodel.create(params);
//     if (!careerjob) {
//       return errorResponse(res, 404, "career job add not properly");
//     }
//     successResponse(res, "success", careerjob);
//   } catch (error) {
//     console.log("error", error);
//     errorResponse(res, 500, "internal server error");
//   }
// }
// async function createjobpostingHandler(req, res) {
//   try {
//     const {
//       jobtitle,
//       location,
//       description,
//       details, // <- full object structure
//     } = req.body;

//     // Validate main fields
//     if (!jobtitle || !location || !description || !details) {
//       return errorResponse(res, 400, "Missing main parameters");
//     }

//     // Validate nested details
//     const { company_description, role_description, qualifications, bonus } =
//       details;

//     if (
//       !company_description ||
//       !role_description ||
//       !Array.isArray(qualifications) ||
//       !Array.isArray(bonus)
//     ) {
//       return errorResponse(res, 400, "Details object missing required fields");
//     }

//     const newJob = await jobpostingmodel.create({
//       jobtitle,
//       location,
//       description,
//       details: {
//         company_description,
//         role_description,
//         qualifications,
//         bonus,
//       },
//     });

//     return successResponse(res, "successf", newJob);
//   } catch (error) {
//     console.log("Error", error);
//     return errorResponse(res, 500, "Internal Server Error");
//   }
// }
// async function updatejobpostingHandler(req, res) {
//   try {
//     const { _id, ...updatedData } = req.body;
//     const options = { new: true };
//     if (
//       !updatedData.jobtitle ||
//       !updatedData.description ||
//       !updatedData.location ||
//       !updatedData.companydescription ||
//       !updatedData.roledescription ||
//       !updatedData.qualifications ||
//       !updatedData.bonusskills
//     ) {
//       errorResponse(res, 404, "Some params are missing");
//       return;
//     }
//     const updated = await jobpostingmodel.findByIdAndUpdate(
//       _id,
//       updatedData,
//       options
//     );

//     successResponse(res, "success Updated", updated);
//   } catch (error) {
//     console.log("error", error);
//     errorResponse(res, 500, "internal server error");
//   }
// }
async function createjobpostingHandler(req, res) {
  try {
    const {
      jobtitle,
      tagline,
      experiencerequired,
      roledescription,
      responsibilities,
      requiredskills,
      qualifications,
      published,
    } = req.body;

    // Validate required fields
    if (
      !jobtitle ||
      !tagline ||
      !experiencerequired ||
      !roledescription ||
      !Array.isArray(responsibilities) ||
      !Array.isArray(requiredskills) ||
      !Array.isArray(qualifications)
    ) {
      return errorResponse(res, 400, "Missing required fields");
    }

    const newJob = await jobpostingmodel.create({
      jobtitle,
      tagline,
      experiencerequired,
      roledescription,
      responsibilities,
      requiredskills,
      qualifications,
      published: published || false,
    });

    return successResponse(res, "Job posting created successfully", newJob);
  } catch (error) {
    console.error("Error creating job posting:", error);
    return errorResponse(res, 500, "Internal Server Error");
  }
}
// async function updatejobpostingHandler(req, res) {
//   try {
//     const { _id, jobtitle, location, description, details } = req.body;

//     if (!_id || !jobtitle || !location || !description || !details) {
//       return errorResponse(res, 400, "Missing required fields");
//     }

//     const { company_description, role_description, qualifications, bonus } =
//       details;

//     if (
//       !company_description ||
//       !role_description ||
//       !Array.isArray(qualifications) ||
//       !Array.isArray(bonus)
//     ) {
//       return errorResponse(res, 400, "Details object is incomplete or invalid");
//     }

//     const updatedJob = await jobpostingmodel.findByIdAndUpdate(
//       _id,
//       {
//         jobtitle,
//         location,
//         description,
//         details: {
//           company_description,
//           role_description,
//           qualifications,
//           bonus,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedJob) {
//       return errorResponse(res, 404, "Job posting not found");
//     }

//     successResponse(res, "Successfully updated", updatedJob);
//   } catch (error) {
//     console.log("error", error);
//     return errorResponse(res, 500, "Internal Server Error");
//   }
// }
async function updatejobpostingHandler(req, res) {
  try {
    const {
      _id,
      jobtitle,
      tagline,
      experiencerequired,
      roledescription,
      responsibilities,
      requiredskills,
      qualifications,
    } = req.body;

    // Validate required fields
    if (
      !_id ||
      !jobtitle ||
      !tagline ||
      !experiencerequired ||
      !roledescription ||
      !Array.isArray(responsibilities) ||
      !Array.isArray(requiredskills) ||
      !Array.isArray(qualifications)
    ) {
      return errorResponse(res, 400, "Missing or invalid required fields");
    }

    const updatedJob = await jobpostingmodel.findByIdAndUpdate(
      _id,
      {
        jobtitle,
        tagline,
        jobtype,
        employmenttype,
        experiencerequired,
        roledescription,
        responsibilities,
        requiredskills,
        qualifications,
      },
      { new: true }
    );

    if (!updatedJob) {
      return errorResponse(res, 404, "Job posting not found");
    }

    return successResponse(res, "Job posting updated successfully", updatedJob);
  } catch (error) {
    console.error("Error updating job posting:", error);
    return errorResponse(res, 500, "Internal Server Error");
  }
}
async function deletejobpostingHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const team = await jobpostingmodel.findByIdAndDelete({ _id: _id });
    if (!team) {
      return errorResponse(res, 404, "team id not found");
    }

    successResponse(res, "Successfuly deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getsinglejobpostingHandler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return errorResponse(res, 404, "some params are missing");
    }
    const data = await jobpostingmodel.findById(id).select(" -_id");
    if (!data) {
      return errorResponse(res, 404, "id not found");
    }
    successResponse(res, "Success", data);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function publishedjobpostingHandler(req, res) {
  try {
    const jobid = req.params.id;
    const { published } = req.body;

    if (typeof published !== "boolean") {
      return errorResponse(res, 400, "Invalid published status");
    }
    const job = await jobpostingmodel.findByIdAndUpdate(
      jobid,
      { published },
      { new: true }
    );

    if (!job) {
      return errorResponse(res, 404, "job not found");
    }
    return successResponse(res, "success", job);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
