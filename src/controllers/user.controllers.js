import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"


const generateAcceesTokenAndRefreshToken = async (userId) => {
    try {

        let user = await User.findById(userId)
        let accessToken = user.generateAccessToken()
        let refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;

        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "somwthng went wrong while generating AccessTokena and RefreshToken")
    }



}


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

    if (ExistingUser) {
        throw new ApiError(409, "user already exists")
    }

    let coverImageLoaclPath;
    let avatarLoaclPath = req.files?.avtar[0]?.path

    if (req.files && Array.isArray(req.files?.coverImage) && req.files?.coverImage.length > 0) {
        coverImageLoaclPath = req.files?.coverImage[0]?.path
    }

    if (!avatarLoaclPath) {
        throw new ApiError(400, "avatar file is required")
    }

    let avatar = await uploadOnCloudinary(avatarLoaclPath)
    let coverimage = coverImageLoaclPath !== "" ? await uploadOnCloudinary(coverImageLoaclPath) : ""

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }


    let user = await User.create({
        fullName,
        avtar: avatar.url,
        coverImage: coverimage?.url || "",
        email,
        username: username?.toLowerCase(),
        password,
    })

    let createdUser = await User.findById(user._id).select("-password -refreshToken")


    if (!createdUser) {
        throw new ApiError(500, "somthinng went wrong, while registering a user")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "user created successfully"))

})


export const logginUser = asyncHandler(async (req, res) => {
    // take user data from user  
    // check username or email
    // find user 
    // check passowrd
    // refresh token and accesstoken genration setup
    // send cockie

    console.log("req-->", req.body)
    const { username, email, password } = req.body

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field are required")
    }

    let user = await User.findOne({ $or: [{ username }, { email }] })

    if (!user) {
        throw new ApiError(409, "user does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "password is incorrect")
    }

    const { refreshToken, accessToken } = await generateAcceesTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

export const logoutUser = asyncHandler(async (req, res) => {

    console.log("----> ",req.user)
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

export const refreshAccessToken= asyncHandler(async(req, res)=>{

    let incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unautorized token")
    }

    const decodedToken =await jwt.verify(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET)

    if(!decodedToken){
        throw new ApiError(401, "Invalid Incoming RefreshToken")
    }

    const user= await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid Incoming RefreshToken")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh Token expired or used ")
    }

    const options = {
        httpOnly:true,
        secure:true,
    }

    const {accessToken, newrefreshToken} = await generateAcceesTokenAndRefreshToken(user?._id)

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",newrefreshToken, options)
    .json(new ApiResponse(200, {accessToken, refreshToken:newrefreshToken}, "Refresh token refreshed "))


})