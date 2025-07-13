import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import * as AppContext from '../../context/AppContext'
import toast from 'react-hot-toast'

const ListRoom = () => {

  const [rooms, setRooms] = useState([])
  const { axios, getToken, user } = AppContext.useAppContext()

  //Fetch Rooms of the Billiard Owner
  const fetchRooms = React.useCallback(async () => {
    try {
      const { data } = await axios.get('/api/room/owner', { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setRooms(data.rooms)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error fetching owner rooms:', error);
      toast.error('Failed to fetch rooms')
    }
  }, [axios, getToken])

  //Toggle Availability of the Room
  const toggleAvailability = async (roomId) => {
    const { data } = await axios.post('/api/room/toggle-availability', { roomId }, { headers: { Authorization: `Bearer ${await getToken()}` } })
    if (data.success) {
      toast.success(data.message)
      fetchRooms()
    } else {
      toast.error(data.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRooms()
    }
  }, [user, fetchRooms])

  return (
    <div>
      <Title align='left' font='outfit' title='Table Listing' subTitle='View, Edit, or manage all listed table. keep the information up-to-date to provide the best experience for users' />
      <p className='text-gray-500 mt-8'>All Table</p>
      <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='py-3 px-4 text-gray-800 font-medium'>Name</th>
              <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden'>Facility</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Price / Hour</th>
              <th className='py-3 px-4 text-gray-800 font-medium text-center'>Actions</th>
            </tr>
          </thead>
          <tbody className='text-sm'>
            {rooms.length > 0 ? rooms.map((item, index) => (
              <tr key={index}>
                <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                  {item.roomType}
                </td>
                <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden'>
                  {Array.isArray(item.amenities) ? item.amenities.join(', ') : Object.keys(item.amenities || {}).filter(key => item.amenities[key]).join(', ')}
                </td>
                <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                  Rp {item.pricePerNight?.toLocaleString()}
                </td>
                <td className='py-3 px-4 border-t border-gray-300 tex-sm text-red-500 text-center'>
                  <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                    <input onChange={() => toggleAvailability(item._id)} type="checkbox" className='sr-only peer' checked={item.isAvailable} />
                    <div className='w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-200'></div>
                    <span className='dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                  </label>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className='py-8 px-4 text-center text-gray-500'>
                  <div className='flex flex-col items-center gap-2'>
                    <p>No rooms found</p>
                    <p className='text-sm'>Add your first room to get started</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default ListRoom