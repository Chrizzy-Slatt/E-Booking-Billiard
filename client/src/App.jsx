import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import BilliardReg from "./components/BilliardReg.jsx";
import Loading from "./components/Loading";
import Layout from "./pages/storeOwner/Layout";
import Dashboard from "./pages/storeOwner/Dashboard";
import AddRoom from "./pages/storeOwner/AddRoom";
import ListRoom from "./pages/storeOwner/ListRoom";
import { Toaster } from 'react-hot-toast'
import * as AppContext from "./context/AppContext.jsx";
import { useUser } from "@clerk/clerk-react";
import Loader from './components/Loader';

const App = () => {
    const { isLoaded } = useUser();
    const isOwnerPath = useLocation().pathname.includes("owner");
    const { showBilliardReg } = AppContext.useAppContext();

    // Show loading screen while Clerk is initializing
    if (!isLoaded) {
        return <Loading />;
    }

    return (
        <div>
            <Toaster />
            {!isOwnerPath && <Navbar />}
            {showBilliardReg && <BilliardReg />}
            <div className='min-h-[70vh]'>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/rooms' element={<AllRooms />} />
                    <Route path='/rooms/:id' element={<RoomDetails />} />
                    <Route path='/my-bookings' element={<MyBookings />} />
                    <Route path='/loader/:nextUrl' element={<Loader/>} />
                    <Route path="/owner" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="add-room" element={<AddRoom />} />
                        <Route path="list-room" element={<ListRoom />} />

                    </Route>
                </Routes>

            </div>
            {!isOwnerPath && <Footer />}
        </div>
    )
}

export default App