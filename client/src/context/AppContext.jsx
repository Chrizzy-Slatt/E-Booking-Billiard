import axios from "axios";
import { createContext, useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";

// Set base URL dari environment variable
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// Buat context
const AppContext = createContext();

// Provider utama
export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "Rp.";
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showBilliardReg, setShowBilliardReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);

    // Fetch semua ruangan
    const fetchRooms = async () => {
        try {
            const { data } = await axios.get('/api/room');
            if (data.success) {
                setRooms(data.rooms);
            }
        } catch (error) {
            console.log('Error fetching rooms:', error.message);
        }
    };

    // Cek apakah user sudah punya billiard terdaftar
    const checkBilliardStatus = useCallback(
        async (token) => {
            try {
                const { data } = await axios.get('/api/billiard/my-billiard', {
                    headers: { Authorization: `Bearer ${token || await getToken()}` }
                });

                if (data.success && data.hasRegistered) {
                    setIsOwner(true);
                }
            } catch (error) {
                console.log('Error checking billiard status:', error.message);
            }
        },
        [getToken]
    );

    // Fetch user data
    const fetchUser = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            try {
                const { data } = await axios.get('/api/users/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setIsOwner(data.role === "billiardOwner");
                    setSearchedCities(data.recentSearchedCities);
                    return;
                }
            } catch {
                console.log('User not found, creating user...');
            }

            // Create user kalau belum ada
            if (user) {
                const userData = {
                    email: user.emailAddresses?.[0]?.emailAddress || '',
                    username: user.fullName || (user.firstName + ' ' + user.lastName) || 'User',
                    image: user.imageUrl || ''
                };

                const { data } = await axios.post('/api/users/create-or-get', userData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setIsOwner(data.user.role === "billiardOwner");
                    setSearchedCities(data.user.recentSearchedCities);
                    await checkBilliardStatus(token);
                }
            }
        } catch (error) {
            console.error('Error fetching/creating user:', error.message);
        }
    }, [getToken, user, checkBilliardStatus]);

    // Jalankan saat user berubah
    useEffect(() => {
        if (user) {
            fetchUser();
        } else {
            setIsOwner(false);
            setSearchedCities([]);
        }
    }, [user, fetchUser]);

    // Fetch data kamar saat awal
    useEffect(() => {
        fetchRooms();
    }, []);

    // Nilai context
    const value = {
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        setIsOwner,
        axios,
        showBilliardReg,
        setShowBilliardReg,
        searchedCities,
        setSearchedCities,
        fetchUser,
        rooms,
        setRooms,
        fetchRooms
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// ⬇️ Tambahkan baris ini
// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
