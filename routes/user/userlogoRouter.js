import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import logomodel from "../../models/logomodel.js";
import logouploadimageRouter from "./userlogouploadRouter.js";

const userlogoRouter = Router();

userlogoRouter.post("/create", createbusinesscardHandler);
userlogoRouter.use("/uploadlogo", logouploadimageRouter);

export default userlogoRouter;

async function createbusinesscardHandler(req, res) {
  try {
    const {
      name,
      email,
      mobile,
      address,
      companyname,
      tagline,
      whichindustryareyou,
      businessdo,
      maincustomers,
      brandtofeel,
      colours,
      coloursavoid,
      logodoprefer,
      specificidea,
      likeustoknow,
    } = req.body;
    if (!name || !email || !mobile) {
      return errorResponse(res, 400, "this field are required");
    }
    const params = {
      name,
      email,
      mobile,
      address,
      companyname,
      tagline,
      whichindustryareyou,
      businessdo,
      maincustomers,
      brandtofeel,
      colours,
      coloursavoid,
      logodoprefer,
      specificidea,
      likeustoknow,
    };
    const businesscard = await logomodel.create(params);
    successResponse(res, "success", businesscard);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
