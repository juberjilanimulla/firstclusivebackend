import { Router } from "express";
import { errorResponse, successResponse } from "../../helpers/serverResponse.js";
import jobmodels from "../../models/jobmodel.js";
import axios from "axios";


const adminjobRouter =Router()

adminjobRouter.post("/create",createjobHandler);
adminjobRouter.get("/",getalljobHandler)
adminjobRouter.post("/update",updatejobHandler);
adminjobRouter.post("/delete",deletejobHandler)
adminjobRouter.get("/single",getsinglejobHandler)

export default adminjobRouter

async function getalljobHandler(req,res){
    try {
        const job = await jobmodels.find();
        if(!job){
            return errorResponse(res,404,"job not found")
        }
        successResponse(res,"success",job)
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}

async function createjobHandler(req,res){
    try {
        const { jobtitle,description,location,companydescription,roledescription,qualifications,bonusskills} = req.body;
        if(!jobtitle || !description ||!location ||!companydescription || !roledescription ||!qualifications ||!bonusskills){
            return errorResponse(res,400,"some params are missing")
        }
        const params={jobtitle,description,location,companydescription,roledescription,qualifications,bonusskills}
        const careerjob = await jobmodels.create(params);
        if(!careerjob){
            return errorResponse(res,404,"career job add not properly")
        } 
        successResponse(res, "success",careerjob);
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}



async function updatejobHandler(req,res){
    try {
        const { _id, ...updatedData } = req.body;
    const options = { new: true };
    if (
      !updatedData.jobtitle ||
      !updatedData.description ||
      !updatedData.location ||
      !updatedData.companydescription ||
      !updatedData.roledescription ||
      !updatedData.qualifications ||
      !updatedData.bonusskills 
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const updated = await jobmodels.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );
    // Update LinkedIn Job Post
    const linkedInJobPost = {
        "jobTitle": updatedData.jobtitle,
        "description": updatedData.description,
        "location": updatedData.location,
        "companyDescription": updatedData.companydescription,
        "roleDescription": updatedData.roledescription,
        "qualifications": updatedData.qualifications,
        "bonusSkills": updatedData.bonusskills
    };

    const linkedInResponse = await updateJobOnLinkedIn(_id, linkedInJobPost);

    successResponse(res, "success Updated", { updated, linkedInResponse });
  
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}

async function deletejobHandler(req,res){
    try {
        const {_id} = req.body;
        if(!_id){
            return errorResponse(res,400,"some params are missing")
        }
        const team = await jobmodels.findByIdAndDelete({_id:_id});
        if(!team){
            return errorResponse(res,404,"team id not found")
        }
        // Delete LinkedIn Job Post
        const linkedInResponse = await deleteJobOnLinkedIn(_id);

        successResponse(res, "Success", { team, linkedInResponse });
    } catch (error) {
        console.log("error",error);
        errorResponse(res,500,"internal server error")
    }
}

async function getsinglejobHandler(req, res) {
    try {
      const { id } = req.query;
      if (!id) {
        return errorResponse(res, 404, "some params are missing");
      }
      const data = await jobmodels
        .findById(id)
        .select(" -_id");
      if (!data) {
        return errorResponse(res, 404, "id not found");
      }
      successResponse(res, "Success", data);
    } catch (error) {
      console.log("error", error);
      errorResponse(res, 500, "internal server error");
    }
  }

  async function postJobToLinkedIn(jobData) {
    const token = 'YOUR_LINKEDIN_ACCESS_TOKEN'; // Obtain this token via OAuth
    const url = 'https://api.linkedin.com/v2/jobs';

    const response = await axios.post(url, jobData, {
        headers: {
            'Authorization': `Bearer ${encoded_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
    });

    return response.data;
}

async function updateJobOnLinkedIn(jobId, jobData) {
    const token = 'YOUR_LINKEDIN_ACCESS_TOKEN'; // Obtain this token via OAuth
    const url = `https://api.linkedin.com/v2/jobs/${jobId}`;

    const response = await axios.put(url, jobData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
    });

    return response.data;
}

async function deleteJobOnLinkedIn(jobId) {
    const token = 'YOUR_LINKEDIN_ACCESS_TOKEN'; // Obtain this token via OAuth
    const url = `https://api.linkedin.com/v2/jobs/${jobId}`;

    const response = await axios.delete(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    });

    return response.data;
}