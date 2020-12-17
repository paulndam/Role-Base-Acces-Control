/** @format */

require("dotenv").config();

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { roles } = require("../roles");

// creating async function to has the password and as well encryt it
async function hashPassword(password) {
	return await bcrypt.hash(password, 10);
}

// now validate the password
//validatePassword on the other hand, will be used when logging in to verify if the password is the same with the password the user provided when signing up
async function validatePassword(plainPassword, hashedPassword) {
	return await bcrypt.compare(plainPassword, hashedPassword);
}

// Then there’s the signup function, the email and password values will ideally be sent from a form then the bodyParser package will parse the data sent through the form and attach it to the req.body object. The provided data is then used to create a new user. Finally, after the user is created we can use the user’s ID to create a JWT, that JWT will be used to identify users and determine what resources they’ll be allowed to access.

// The JWT_SECRET environmental variable holds a private key that is used when signing the JWT, this key will also be used when parsing the JWT to verify that it hasn’t been compromised by an authorized party.

module.exports = {
	Register: async (req, res, next) => {
		try {
			const { email, password, role } = req.body;
			const hashedPassword = await hashPassword(password);
			const newUser = new User({
				email,
				password: hashedPassword,
				role: role || "basic",
			});
			const accessToken = jwt.sign(
				{ userId: newUser._id },
				process.env.JWT_SECRET,
				{
					expiresIn: 86400, //24hrs
				}
			);

			// seting the token to the new user
			newUser.accessToken = accessToken;
			await newUser.save();
			res.json({
				data: newUser,
				accessToken,
				message: `User successfullly created`,
			});
		} catch (error) {
			next(error);
		}
	},

	LogIn: async (req, res, next) => {
		try {
			const { email, password } = req.body;
			const user = await User.findOne({ email });

			if (!user) {
				return next(
					new Error(
						`Email doesn't exist,please register or try a different email`
					)
				);
			}

			const validPassword = await validatePassword(password, user.password);

			if (!validPassword) {
				return next(new Error(`Invalid password`));
			}

			const accessToken = jwt.sign(
				{ userId: user._id },
				process.env.JWT_SECRET,
				{
					expiresIn: 86400, // 24hrs
				}
			);

			await User.findByIdAndUpdate(user._id, { accessToken });
			res.status(200).json({
				data: { email: user.email, role: user.role },
				accessToken,
				message: `user logged in successfully`,
			});
		} catch (error) {
			next(error);
		}
	},

	getUsers: async (req, res, next) => {
		const users = await User.find({});
		res.status(200).json({
			data: users,
		});
	},

	getOneUser: async (req, res, next) => {
		try {
			const userId = req.params.userId;
			const user = await User.findById(userId);

			if (!user) {
				return next(new Error(`user doesn't exist`));
			}
			res.status(200).json({
				data: user,
				message: `Here is the one user you looking for`,
			});
		} catch (error) {
			next(error);
		}
	},

	updateUser: async (req, res, next) => {
		try {
			const update = req.body;
			const userId = req.params.userId;
			await User.findByIdAndUpdate(userId, update);
			const user = await User.findById(userId);
			res.status(200).json({
				data: user,
				message: `user have been updated Successfully`,
			});
		} catch (error) {
			next(error);
		}
	},

	deleteUser: async (req, res, next) => {
		try {
			const userId = req.params.userId;
			await User.findByIdAndDelete(userId);
			res.status(200).json({
				data: null,
				message: `user have been deleted`,
			});
		} catch (error) {
			next(error);
		}
	},

	//The grantAccess middleware, on the other hand, allows only users with certain roles access to the route. It takes two arguments action and resource, action will be a value such as readAny, deleteAny, etc.. this indicates what action the user can perform while resource represents what resource the defined action has permission to operate on e.g profile. The roles.can(userRole)[action](resource) method determines if the user’s role has sufficient permission to perform the specified action of the provided resource. We’ll see exactly how this works next.

	grantAccess(action, resource) {
		return async (req, res, next) => {
			try {
				const permission = roles.can(req.user.role)[action](resource);

				if (!permission.granted) {
					return res.status(401).json({
						error: `no clearance to perfrom this action`,
					});
				}
				next();
			} catch (error) {
				next(error);
			}
		};
	},

	// The allowIfLoggedIn middleware will filter and only grant access to users that are logged in, the res.locals.loggedInUser variable holds the details of the logged-in user, i will implement this variable very soon.

	grantAccessIfLoggedIn: async (req, res, next) => {
		try {
			const user = res.locals.loggedInuser;

			if (!user) {
				return res.status(401).json({
					error: `need to log in to access route`,
				});
			}
			req.user = user;
			next();
		} catch (error) {
			next(error);
		}
	},
};
