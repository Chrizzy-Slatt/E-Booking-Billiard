import React, { useEffect, useState, useCallback } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import * as AppContext from '../context/AppContext'
import { toast } from 'react-toastify'

const MyBookings = () => {
  const { axios, getToken, user } = AppContext.useAppContext()
  const [bookings, setBookings] = useState([])

  const fetchUserBookings = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/bookings/user', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios, getToken])


  const handlePayment = async (bookingId)=>{
    try {
      const { data } = await axios.post('/api/midtrans/get-payment-token',
         {bookingId},{headers:{ Authorization:`Bearer ${await getToken()}`}})
         console.log("TRACE", data)
         if (data.success){
          window.snap.pay(data.token, {
            onSuccess(result) {
              console.log(result)
              window.location.reload()
            },
            onPending() {
              noop();
            },
            onError(result) {
              console.log('Payment failed, please try again');
            },
            onClose() {
              noop();
            },
          });
         }else {
          console.log(data.message)
         }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserBookings()
    }
  }, [fetchUserBookings, user])

  return (
    <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
      <Title
        title='My Bookings'
        subTitle='Easily manage your past, current, and upcoming billiard table reservations in one place. Plan yours seamlessly with just a few clicks'
        align='left'
      />

      <div className='max-w-6xl mt-8 w-full text-gray-800'>
        <div className='hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
          <div className='w-1/3'>Billiard</div>
          <div className='w-1/3'>Date & Timings</div>
          <div className='w-1/3'>Payment</div>
        </div>

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className='grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t'
          >
            {/* Billiard Details */}
            <div className='flex flex-col md:flex-row'>
              <img
                src={booking.room?.images?.[0] || '/placeholder.jpg'}
                alt="billiard-img"
                className='min-md:w-44 rounded shadow object-cover'
              />
              <div className='flex flex-col gap-1.5 max-md:mt-3 min-md:ml-4'>
                <p className='font-playfair text-2xl'>
                  {booking.billiard?.name || "Billiard Name"}
                  <span className='font-inter text-sm'>
                    {" "}({booking.room?.roomType || "Room"})
                  </span>
                </p>

                <div className='flex items-center gap-1 text-sm text-gray-500'>
                  <img src={assets.locationIcon} alt="location-icon" />
                  <span>{booking.billiard?.address || "No address available"}</span>
                </div>
                {/* <div className='flex items-center gap-1 text-sm text-gray-500'>
                  <img src={assets.guestsIcon} alt="guests-icon" />
                  <span>Guests: {booking.guests}</span>
                </div> */}
                <p className='text-base'>Total: Rp {booking.totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Date & Timings */}
            <div className='flex flex-row md:items-center md:gap-12 mt-3 gap-8'>
              <div>
                <p>Start:</p>
                <p className='text-gray-500 text-sm'>
                  {booking.checkInDate ? new Date(booking.checkInDate).toLocaleString() : "-"}
                  {/* {booking.checkInDate ? new Date(booking.checkInDate).toDateString() : "-"} */}
                </p>
              </div>
              <div>
                <p>End:</p>
                <p className='text-gray-500 text-sm'>
                  {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleString() : "-"}
                  {/* {booking.checkOutDate ? new Date(booking.checkOutDate).toDateString() : "-"} */}
                </p>
              </div>
            </div>

            {/* Payment Status */}
            <div className='flex flex-col items-start justify-center pt-3'>
              <div className='flex items-center gap-2'>
                <div className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
                <p className={`text-sm ${booking.isPaid ? "text-green-500" : "text-red-500"}`}>
                  {booking.isPaid ? "Paid" : "Unpaid"}
                </p>
              </div>
              {!booking.isPaid && (
                <button onClick={()=>handlePayment(booking._id)} className='px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full
                 hover:bg-gray-50 transition-all cursor-pointer'>
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyBookings
