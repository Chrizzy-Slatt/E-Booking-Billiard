import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { assets, facilityIcons } from '../assets/assets';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';

const ImageGallery = ({ images, roomId, navigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className='md:w-1/2 relative group'>
      <img
        onClick={() => { navigate(`/rooms/${roomId}`); scrollTo(0, 0); }}
        src={images[currentImageIndex]}
        alt="billiard-img"
        title='View Room Details'
        className='max-h-65 w-full rounded-xl shadow-lg object-cover cursor-pointer'
      />
      {images.length > 1 && (
        <>
          <button onClick={prevImage} className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70'>←</button>
          <button onClick={nextImage} className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70'>→</button>
          <div className='absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs'>{currentImageIndex + 1} / {images.length}</div>
          <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1'>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CheckBox = ({ label, selected = false, onChange = () => { } }) => (
  <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
    <input type="checkbox" checked={selected} onChange={(e) => onChange(e.target.checked, label)} />
    <span className='font-light select-none'>{label}</span>
  </label>
);

const RadioButton = ({ label, selected = false, onChange = () => { } }) => (
  <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
    <input type="radio" name='sortOption' checked={selected} onChange={() => onChange(label)} />
    <span className='font-light select-none'>{label}</span>
  </label>
);

const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { rooms, fetchRooms, currency } = useAppContext();

  const [openFilters, setOpenFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ roomTypes: [], priceRanges: [] });
  const [selectedSort, setSelectedSort] = useState('');

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const roomTypes = ["XINGJUE", "MR.SUNG", "MAJESTIX", "NOBRAND"];
  const priceRanges = ["0 to 10000", "10000 to 20000", "20000 to 50000", "50000 to 100000"];
  const sortOptions = ["Price Low To High", "Price High To Low", "Newest First"];

  const handleFiltersChange = (checked, value, type) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (checked) updated[type].push(value);
      else updated[type] = updated[type].filter(item => item !== value);
      return updated;
    });
  };

  const handleSortChange = (option) => setSelectedSort(option);

  const matchesRoomType = useCallback((room) =>
    selectedFilters.roomTypes.length === 0 || selectedFilters.roomTypes.includes(room.roomType),
    [selectedFilters.roomTypes]
  );

  const matchesPriceRange = useCallback((room) =>
    selectedFilters.priceRanges.length === 0 || selectedFilters.priceRanges.some(range => {
      const [min, max] = range.split(' to ').map(Number);
      return room.pricePerNight >= min && room.pricePerNight <= max;
    }),
    [selectedFilters.priceRanges]
  );

  const filterDestination = useCallback((room) => {
    const destination = searchParams.get('destination');
    return !destination || room.billiard?.city?.toLowerCase().includes(destination.toLowerCase());
  }, [searchParams]);

  const sortRooms = useCallback((a, b) => {
    if (selectedSort === 'Price Low To High') return a.pricePerNight - b.pricePerNight;
    if (selectedSort === 'Price High To Low') return b.pricePerNight - a.pricePerNight;
    if (selectedSort === 'Newest First') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  }, [selectedSort]);

  const filteredRooms = useMemo(() => {
    return rooms
      .filter(matchesRoomType)
      .filter(matchesPriceRange)
      .filter(filterDestination)
      .sort(sortRooms);
  }, [rooms, matchesRoomType, matchesPriceRange, filterDestination, sortRooms]);

  const clearFilters = () => {
    setSelectedFilters({ roomTypes: [], priceRanges: [] });
    setSelectedSort('');
    setSearchParams({});
  };

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
      <div>
        <div className='flex flex-col items-start text-left'>
          <h1 className='font-playfair text-4xl md:text-[40px]'>Billiard Tables</h1>
          <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>Take Advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories</p>
        </div>

        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
              <ImageGallery images={room.images} roomId={room._id} navigate={navigate} />
              <div className='md:w-1/2 flex flex-col gap-2'>
                <p className='text-gray-500'>{room.billiard?.city || 'City'}</p>
                <p onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0); }} className='text-gray-800 text-3xl font-playfair cursor-pointer'>{room.billiard?.name || 'Billiard Name'}</p>
                <div className='flex items-center'>
                  <StarRating />
                  <p className='ml-2'>New listing</p>
                </div>
                <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                  <img src={assets.locationIcon} alt="location-icon" />
                  <span>{room.billiard?.address || 'Address'}</span>
                </div>
                {/* <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                  {room.amenities && Object.keys(room.amenities).filter(key => room.amenities[key]).map((item, index) => (
                    <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                      <img src={facilityIcons[item] || assets.wifiIcon} alt={item} className='w-5 h-5' />
                      <p className='text-xs'>{item}</p>
                    </div>
                  ))}
                </div> */}
                <p className='text-xl font-medium text-gray-700'>Rp {room.pricePerNight?.toLocaleString()} /Hour</p>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-20'>
            <p className='text-gray-500 text-lg'>No billiard rooms available at the moment.</p>
            <p className='text-gray-400 text-sm mt-2'>Please check back later or contact us for more information.</p>
          </div>
        )}
      </div>

      <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16'>
        <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilters && "border-b"}`}>
          <p className='text-base font-medium text-gray-800'>FILTERS</p>
          <div className='text-xs cursor-pointer'>
            <span onClick={() => setOpenFilters(!openFilters)} className='lg:hidden'>
              {openFilters ? 'HIDE' : 'SHOW'}
            </span>
            <span onClick={clearFilters} className='hidden lg:block'>CLEAR</span>
          </div>
        </div>

        <div className={`${openFilters ? 'h-auto' : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}>
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Popular Filters</p>
            {roomTypes.map((room, index) => (
              <CheckBox
                key={index}
                label={room}
                selected={selectedFilters.roomTypes.includes(room)}
                onChange={(checked) => handleFiltersChange(checked, room, 'roomTypes')}
              />
            ))}
          </div>

          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox
                key={index}
                label={`${currency} ${range}`}
                selected={selectedFilters.priceRanges.includes(range)}
                onChange={(checked) => handleFiltersChange(checked, range, 'priceRanges')}
              />
            ))}
          </div>

          <div className='px-5 pt-5 pb-7'>
            <p className='font-medium text-gray-800 pb-2'>Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={() => handleSortChange(option)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
