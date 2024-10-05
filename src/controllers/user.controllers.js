import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"


export const registerUser = asyncHandler(async (req, res) => {
    // take user details 
    // check user already exits or not
    // check required field provided or not
    // if there is image or avatar then check its also then upload on cloudary and take url if image aor avatar is provided but not uploaded on  cloudinary dur eto some issue so please thorw error
    // remove sensitive field like password and refresh token 
    // after all this task register user

    console.log("req-->", req.body)
    const { username, email, fullName, password } = req.body

    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field are required")
    }

    let ExistingUser = await User.findOne({ $or: [{ username }, { email }] })

    if(ExistingUser){
        throw new ApiError(409, "user already exists")
    }

    let coverImageLoaclPath;
    let avatarLoaclPath = req.files?.avtar[0]?.path
    
    if(req.files  && Array.isArray(req.files?.coverImage) && req.files?.coverImage.length > 0 ){
        coverImageLoaclPath=req.files?.coverImage[0]?.path
    }

    if(!avatarLoaclPath){
        throw new ApiError(400,"avatar file is required")
    }

    let avatar = await uploadOnCloudinary(avatarLoaclPath)
    let coverimage = coverImageLoaclPath !== "" ? await uploadOnCloudinary(coverImageLoaclPath) : ""

    if(!avatar){
        throw new ApiError(400,"avatar file is required")
    }


    let user = await User.create({
        fullName,
        avtar:avatar.url,
        coverImage: coverimage?.url || "",
        email,
        username:username?.toLowerCase(),
        password,
    })

    let createdUser= await User.findById(user._id).select("-password -refreshToken")


    if(!createdUser){
        throw new ApiError(500, "somthinng went wrong, while registering a user")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "user created successfully"))

})