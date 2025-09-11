import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
export const signUp = async (req, res) => {
    try {
        const {name, email, password} = req.body
        if(!name || !email || ! password){
            return res.status(400).json({
                message: "Something is missing",
                success: false
            })
        }

        const existEmail = await User.findOne({ email })
        if(existEmail){
            return res.status(400).json({
                message: "User already exist with this email."
            })
        }

        if(password.length < 6){
            return res.status(400).json({
                message: "password must be at least 6 character !"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

         const user = await User.create({
            name,
            password:hashedPassword,
            email
        })

        const token = await genToken(user._id)

        res.cookie("token",token,{
            httpOnly: true,
            maxAge: 7*24*60*60*1000,
            sameSite: "strict",
            secure: false
        })
        
        return res.status(201).json({
            message: `Welcome back ${user.name}`,
            user,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: `sign up error ${error}`
        })
    }
}


export const login = async (req, res) => {
    try {
        const {email, password} = req.body
        if(!email || ! password){
            return res.status(400).json({
                message: "Something is missing",
                success: false
            })
        }

        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({
                message: "email does not exists !."
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({
                message: "Incorrect Password"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const token = await genToken(user._id)
        res.cookie("token",token,{
            httpOnly: true,
            maxAge: 7*24*60*60*1000,
            sameSite: "strict",
            secure: false
        })
        
        return res.status(200).json({
            message: `Welcome back ${user.name}`,
            user,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: `login error ${error}`
        })
    }
}


export const logout = async(req, res) => {
    try {
        return res.status(200).cookie("token","", {maxAge: 0}).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: `Logged out error ${error}`
        })
    }
}