import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import * as AppContext from '../context/AppContext'
import toast from 'react-hot-toast'

const BilliardReg = () => {

    const { setShowBilliardReg, axios, getToken, setIsOwner, fetchUser } = AppContext.useAppContext()

    const [name, setName] = useState("")
    const [contact, setContact] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            const token = await getToken();
            if (!token) {
                toast.error('Please login first to register your billiard');
                return;
            }

            const { data } = await axios.post('/api/billiard', { name, address, contact, city }, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                toast.success(data.message)
                setIsOwner(true)
                setShowBilliardReg(false);
                // Refresh user data to update isOwner state from server
                await fetchUser();
            } else {
                if (data.message.includes('already have a registered billiard')) {
                    toast.error(data.message);
                    // If user already has billiard, set isOwner to true and close modal
                    setIsOwner(true);
                    setShowBilliardReg(false);
                } else {
                    toast.error(data.message || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || error.message || 'Registration failed')
        }
    }

    return (
        <div onClick={() => setShowBilliardReg(false)} className='fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-black/70'>
            <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className='flex bg-white rounded-xl max-w-4xl max-md:mx-2'>
                <img src={assets.regImage} alt="reg-image" className='w-1/2 rounded-xl hidden md:block' />

                <div className='relative flex flex-col items-center md:w-1/2 p-8 md:p-10'>
                    <img src={assets.closeIcon} alt="close-icon" className='absolute top-4 right-4 h-4 w-4 cursor-pointer' onClick={() => setShowBilliardReg(false)} />
                    <p className='text-2xl font-semibold mt-6'>Register Your Store</p>

                    {/* Store Name */}
                    <div className='w-full mt-4'>
                        <label htmlFor="name" className='font-medium text-gray-500'>Store Name</label>
                        <input id='name' onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Type Here' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required />
                    </div>

                    {/* Phone */}
                    <div className='w-full mt-4'>
                        <label htmlFor="contact" className='font-medium text-gray-500'>Phone</label>
                        <input onChange={(e) => setContact(e.target.value)} value={contact} id='contact' type="text" placeholder='Type Here' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required />
                    </div>

                    {/* Store Address */}
                    <div className='w-full mt-4'>
                        <label htmlFor="address" className='font-medium text-gray-500'>Address</label>
                        <input onChange={(e) => setAddress(e.target.value)} value={address} id='address' type="text" placeholder='Type Here' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required />
                    </div>
                    {/* Select City Drop-Down */}
                    <div className='w-full mt-4 max-w-60 mr-auto'>
                        <label htmlFor="city" className='font-medium text-gray-500'>City</label>
                        <select onChange={(e) => setCity(e.target.value)} value={city} id="city" className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required>
                            <option value="">Select City</option>
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <button className='bg-indigo-500 hover:bg-indigo-600 transition-all text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6'>Register</button>

                </div>
            </form>
        </div>
    )
}

export default BilliardReg