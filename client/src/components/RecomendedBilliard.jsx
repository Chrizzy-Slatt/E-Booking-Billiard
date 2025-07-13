import React, { useEffect, useState } from 'react'
import BilliardCard from './BilliardCard'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
import * as AppContext from '../context/AppContext'

const RecomendedBilliard = () => {
    const { rooms, searchedCities } = AppContext.useAppContext();
    const [recomended, setRecomended] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const filterBilliard = rooms.filter(room =>
            searchedCities.includes(room.billiard.city)
        );
        setRecomended(filterBilliard);
    }, [rooms, searchedCities]);

    return recomended.length > 0 && (
        <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
            <Title
                title='Recomended Billiard'
                subTitle='Discover our handpicked selection of exceptional billiard tables around the world, offering unparalleled luxury and unforgettable experiences.'
            />

            <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
                {recomended.slice(0, 4).map((room, index) => (
                    <BilliardCard key={room._id} room={room} index={index} />
                ))}
            </div>

            <button
                onClick={() => {
                    navigate('/rooms');
                    window.scrollTo(0, 0);
                }}
                className='my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer'
            >
                View All Tables
            </button>
        </div>
    );
}

export default RecomendedBilliard;
