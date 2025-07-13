import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import heroImage from '../assets/heroImage.jpg'
import * as AppContext from '../context/AppContext'

const Hero = () => {

    const { navigate, axios, setSearchCities } = AppContext.useAppContext()
    const [destination, setDestination] = useState("")
    // const [checkInDate, setCheckInDate] = useState('');
    // const [checkOutDate, setCheckOutDate] = useState('');


    const onSearch = async (e) => {
        e.preventDefault();
        navigate(`/rooms?destination=${destination}`)
        // call api to save srecent searched city
        await axios.post('/api/user/store-recent-search', {
            recentSearchedCity:
                destination
        }, { headers: { Authorization: `Bearer ${await getToken()}` } });

        //add destination to searchedCities max 3 recent searched cities
        setSearchCities((prevSearchedCities) => {
            const updatedSearchedCities = [...prevSearchedCities, destination];
            if (updatedSearchedCities.length > 3) {
                updatedSearchedCities.shift();
            }
            return updatedSearchedCities;
        })
    }

    return (
        <div className='flex flex-col items-start justify-center px-6
        md:px-16 lg:px-24 xl:px-32 text-white bg-no-repeat bg-cover bg-center h-screen' style={{ backgroundImage: `url(${heroImage})` }}>
            <p className='bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20'>The Ultimate Billiard Experience</p>
            <h1 className='font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4'>Discover Your Perfect Billiard Experience</h1>
            <p className='max-w-130 mt-2 text-sm md:text-base'>At Pocket Billiards, we live and breathe the game.
                From classic 8-ball to competitive snooker, our passion for cue sports drives everything we do.
                We offer a curated selection of high-quality tables, cues, and accessories — plus resources, training, and a welcoming community for players of all levels.
                Whether you're here to unwind, compete, or improve your skills, you've found your home on the felt.
            </p>

            <form onSubmit={onSearch} className='bg-white text-gray-500 rounded-lg px-6 py-4 mt-8  flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'>

                <div>
                    <div className='flex items-center gap-2'>
                        <img src={assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="destinationInput">Location</label>
                    </div>
                    <input onChange={e => setDestination(e.target.value)} value=
                        {destination} list='destinations' id="destinationInput" type="text" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" required />
                    <datalist id='destinations'>
                        {cities.map((city, index) => (<option value={city} key={index}>
                        </option>))}
                    </datalist>
                </div>

                {/* <div>
                    <div className='flex items-center gap-2'>
                        <img src={assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="checkIn">Start</label>
                    </div>
                    <input id="checkIn" type="datetime-local" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
                    
                </div> */}

                {/* <div>
                    <div className='flex items-center gap-2'>
                        <img src={assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="checkOut">End</label>
                    </div>
                    <input id="checkOut" type="datetime-local" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
                </div> */}

                {/* <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor="guests">Guests</label>
                    <input min={1} max={4} id="guests" type="number" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16" placeholder="0" />
                </div> */}

                <button className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
                    <img src={assets.searchIcon} alt="searchIcon" className='h-7' />
                    <span>Search</span>
                </button>
            </form>
        </div>
    )
}

export default Hero