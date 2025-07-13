import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

// Mini Image Gallery for Card
const CardImageGallery = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className='relative group'>
      <img src={images[currentImageIndex]} alt="" className='w-full h-48 object-cover' />

      {images.length > 1 && (
        <>
          {/* Navigation Arrows - only show on hover */}
          <button
            onClick={prevImage}
            className='absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm'
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className='absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm'
          >
            →
          </button>

          {/* Image Counter */}
          <div className='absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs'>
            {currentImageIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

const BilliardCard = ({room, index}) => {
  return (
      <Link to={'/rooms/' + room._id} onClick={()=> scrollTo(0,0)} key={room._id} className='relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)]'>
      <CardImageGallery images={room.images} />
      {index % 2 === 0 && <p className='px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full'>Recommended</p>}
      <div className='p-4 pt-5'>
        <div className='flex items-center justify-between'>
          <p className='font-playfair text-xl font-medium text-gray-800'>{room.billiard?.name || 'Billiard Room'}</p>
          <div className='flex items-center gap-1'>
            <img src={assets.starIconFilled} alt="star-icon" /> 4.5
          </div>
        </div>
        <div className='flex items-center gap-1 text-sm'>
          <img src={assets.locationIcon} alt="location-icon" />
          <span>{room.billiard?.address || 'Address'}</span>
        </div>
        <div className='flex items-center justify-between mt-4'>
          <p><span className='text-xl text-gray-800'>Rp {room.pricePerNight?.toLocaleString()}</span>/Hour</p>
          <button className='px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer'>Book Now</button>
        </div>
      </div>
        </Link>
    
  )
}

export default BilliardCard