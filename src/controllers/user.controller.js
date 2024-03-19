import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const userRegister = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        // sanitizing inputs
        const isEmptyFields = [fullname, email, password].some((field) => field?.trim() === "")
        if (isEmptyFields) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const isAlreadyExistingUser = await User.findOne({ email: email });
        if (isAlreadyExistingUser) {
            return res.status(409).json({ message: 'Email is already in use' });
        }

        const user = await User.create({ fullname, email, role: 'user', password });
        const createdUser = await User.findOne({ _id: user._id }).select('-password');

        if (!createdUser) {
            return res.status(500).json({ message: 'User registration failed' });
        }

        return res.status(201).json({ message: 'Registration Successful', data: createdUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server Error' });
    }
}

const tokenVerification = async (req, res) => {
    const { token } = req.body;
    try {
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log('error..', err)
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token expired' });
                } else {
                    return res.status(401).json({ message: 'Invalid token' });
                }
            }
            else {
                if (decoded) {
                    return res.status(200).json({ message: 'Token verification success', data: decoded })
                }
                console.log('respoinse', decoded)
            }
        });

    } catch (err) {
        console.log('err', err)
        console.error(err);
        return res.status(500).json({ message: 'Server Error' });
    }
}

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const isEmptyFields = [email, password].some((field) => field?.trim() === "");
        if (isEmptyFields) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 404, message: "User doesn't exist" });
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ status: 401, message: 'Incorrect password' });
        }

        const accessToken = await user.generateAccessToken();
        const options = {
            httpOnly: true,
            secure: true
        };

        return res.status(200).cookie('accesToken', accessToken, options).json({ status: 200, message: 'Logged In Successfully', token: accessToken });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: 'Server Error' });
    }
};

const userLogout = async (req, res) => {
    try {
        const options = {
            httpOnly: true,
            secure: true
        }

        return res.clearCookie('accessToken', options).json({ status: 200, message: 'Succesfully Logout' })
    }
    catch (err) {
        res.send({ status: 500, message: 'Server Error' })
        throw err;
    }

}

const updateUser = async (req, res) => {

    const { fullname, email } = req.body;
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ status: 404, message: "User doesn't exist" });
        }

        user.fullname = fullname;
        user.email = email;
        await user.save();

        return res.status(200).json({ status: 200, message: 'User Details updated successfully', data: user });
    }
    catch (err) {
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const allUsers = await User.find({ role: 'user' }).select('-password').skip(skip).limit(limit)
        const totalCount = await User.countDocuments({ role: 'user' });

        const isHasMore = (page * limit) <= totalCount;

        if (allUsers?.length === 0) {
            return res.status(204).json({ message: 'No content' })
        }
        res.status(200).json({ status: 200, message: 'Users found', data: allUsers, isHasMore });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server Error', err });
    }
}

const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const isDelete = await User.deleteOne({ _id: userId })
        if (isDelete.deletedCount === 0) {
            return res.json({ status: 204, message: 'User deletion failed, Try again' });
        } else {
            return res.json({ status: 200, message: 'Successfully deleted a User' });
        }
    }
    catch (err) {
        return res.json({ status: 500, message: 'Server Error' });
    }
}


export { userRegister, tokenVerification, userLogin, userLogout, updateUser, getAllUsers, deleteUser }