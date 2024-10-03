import mongoose, { Schema } from 'mongoose'
import jwt from 'jsonwebtoken'
import bcript from 'bcrypt'


const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
        lowercase: true,
    },
    avtar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String,
    }


}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = bcript.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcript.compare(password, this.password)
}
userSchema.methods.generateAccessToken = async function (password) {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },
    )
}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}

export const User = mongoose.model("User", userSchema)