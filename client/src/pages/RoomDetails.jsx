import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets, facilityIcons, roomCommonData, roomsDummyData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react';

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { isLoaded } = useUser();
    const { rooms } = useAppContext();

    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);

    useEffect(() => {
        const roomsData = rooms.length > 0 ? rooms : roomsDummyData;
        const foundRoom = roomsData.find((r) => r._id === id);

        if (foundRoom) {
            setRoom(foundRoom);
            setMainImage(foundRoom.images?.[0] || null);
        } else {
            setRoom(null);
            setMainImage(null);
        }
    }, [rooms, id]);

    const checkAvailabililty = async () => {
        try {
            if (new Date(checkInDate) >= new Date(checkOutDate)) {
                toast.error('Check-In Date should be less than Check-Out Date');
                return;
            }

            const { data } = await axios.post('/api/bookings/check-availability', {
                room: id,
                checkInDate,
                checkOutDate,
            });

            if (data.success) {
                if (data.isAvailable) {
                    setIsAvailable(true);
                    toast.success('Room is available');
                } else {
                    setIsAvailable(false);
                    toast.error('Room is not available');
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!isAvailable) return checkAvailabililty();
        if (!isLoaded) return toast.error("Clerk is still loading...");

        try {
            const token = await getToken();
            const { data } = await axios.post(
                '/api/bookings/book',
                {
                    room: id,
                    checkInDate,
                    checkOutDate,
                    guests,
                    paymentMethod: 'Pay At Billiard',
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data.success) {
                toast.success(data.message);
                navigate('/my-bookings');
                window.scrollTo(0, 0);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (!room) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-gray-500 text-lg'>Room not found or still loading...</p>
            </div>
        );
    }

    return (
        <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
                <h1 className='text-3xl md:text-4xl font-playfair'>
                    {room.billiard?.name || 'Unknown Billiard'}
                    <span className='font-inter text-sm ml-3'>({room.roomType})</span>
                </h1>
                <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'> 20% OFF</p>
            </div>

            <div className='flex items-center gap-1 mt-2'>
                <StarRating />
                <p className='ml-2'>200+ Reviews</p>
            </div>

            <div className='flex items-center gap-1 text-gray-500 mt-2'>
                <img src={assets.locationIcon} alt='location-icon' />
                <span>{room.billiard?.address || 'No address provided'}</span>
            </div>

            <div className='flex flex-col lg:flex-row mt-6 gap-6'>
                <div className='lg:w-1/2 w-full'>
                    {mainImage ? (
                        <img src={mainImage} alt='Room' className='w-full rounded-xl shadow-lg object-cover' />
                    ) : (
                        <div className='w-full h-64 bg-gray-200 rounded-xl'></div>
                    )}
                </div>
                <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
                    {room.images?.length > 1 &&
                        room.images.map((image, index) => (
                            <img
                                onClick={() => setMainImage(image)}
                                key={index}
                                src={image}
                                alt='Room'
                                className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image ? 'outline-3 outline-orange-500' : ''
                                    }`}
                            />
                        ))}
                </div>
            </div>

            <div className='flex flex-col md:flex-row md:justify-between mt-10'>
                <div className='flex flex-col'>
                    <h1 className='text-3xl md:text-4xl font-playfair'>Experience Luxury Like Never Before</h1>
                    {/* <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                        {room.amenities?.map((item, index) => (
                            <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                                <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                                <p className='text-xs'>{item}</p>
                            </div>
                        ))}
                    </div> */}
                </div>
                <p className='text-2xl font-medium'>Rp. {room.pricePerNight.toLocaleString()}/Hour</p>
            </div>

            <form
                onSubmit={onSubmitHandler}
                className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'
            >
                <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
                    <div className='flex flex-col'>
                        <label htmlFor='checkInDate' className='font-medium'>
                            Start
                        </label>
                        <input
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            type='datetime-local'
                            id='checkInDate'
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />
                    </div>

                    <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>

                    <div className='flex flex-col'>
                        <label htmlFor='checkOutDate' className='font-medium'>
                            End
                        </label>
                        <input
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate}
                            disabled={!checkInDate}
                            type='datetime-local'
                            id='checkOutDate'
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />
                    </div>

                    {/* <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div> */}

                    {/* <div className='flex flex-col'>
                        <label htmlFor='guests' className='font-medium'>
                            Guests
                        </label>
                        <input
                            onChange={(e) => setGuests(e.target.value)}
                            value={guests}
                            type='number'
                            id='guests'
                            placeholder='1'
                            className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />
                    </div> */}
                </div>
                <button
                    type='submit'
                    className='bg-blue-500 hover:bg-blue-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'
                >
                    {isAvailable ? 'Book Now' : 'Check Availability'}
                </button>
            </form>

            <div className='mt-25 space-y-4'>
                {roomCommonData.map((spec, index) => (
                    <div key={index} className='flex items-start gap-2'>
                        <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5' />
                        <div>
                            <p className='text-base'>{spec.title}</p>
                            <p className='text-gray-500'>{spec.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
                <p>
                    Customers will be welcomed on the showroom floor based on cue rack availability. You’ll enjoy a premium two-cue billiard set that captures the true spirit of the game. The listed price includes gear for two players. Please select the total number of players to see the accurate price for larger groups.
                </p>
            </div>

            <div className='flex flex-col items-start gap-4'>
                <div className='flex gap-4'>
                    <img
                        src={room.billiard?.owner?.image || assets.defaultUser}
                        alt='Host'
                        className='h-14 w-14 md:h-18 md:w-18 rounded-full'
                    />
                    <div>
                        <p className='text-lg md:text-xl'>Hosted by {room.billiard?.name || 'Unknown'}</p>
                        <div className='flex items-center mt-1'>
                            <StarRating />
                            <p className='ml-2'>200+ reviews</p>
                        </div>
                    </div>
                </div>
                <button  className='px-6 py-2.5 mt-4 rounded text-white bg-blue-500 hover:bg-blue-dull transition-all cursor-pointer'>
                    <a href="https://www.whatsapp.com/?lang=id_ID">Contact Now</a>
                 
                </button>
            </div>
        </div>
    );
};

export default RoomDetails;
