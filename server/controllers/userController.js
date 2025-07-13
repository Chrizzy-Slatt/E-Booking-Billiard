// Get API users
import User from "../models/Users.js";

export const getUserData = async (req, res)=> {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({success: true, role, recentSearchedCities})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Create or get user if not exists
export const createOrGetUser = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { email, username, image } = req.body;

        if (!userId) {
            return res.json({success: false, message: "not authenticated"});
        }

        // Check if user already exists
        let user = await User.findById(userId);

        if (!user) {
            // Create new user if doesn't exist
            console.log('Creating new user from client request:', userId);
            user = await User.create({
                _id: userId,
                email: email,
                username: username || "User",
                image: image || "",
                recentSearchedCities: "",
                role: "user"
            });
            console.log('User created successfully:', user._id);
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                recentSearchedCities: user.recentSearchedCities
            }
        });
    } catch (error) {
        console.error('Create or get user error:', error);
        res.json({success: false, message: error.message});
    }
}

// Store user recent searched cities

export const storerecentSearchedCities = (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ message: "City is required." });
  }

  // Simulasikan penyimpanan, bisa di database atau array sementara
  console.log(`Recent city stored: ${city}`);

  res.status(200).json({ message: "Recent search stored successfully." });
};