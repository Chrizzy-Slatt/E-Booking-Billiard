import React from 'react'
import { assets } from '../assets/assets'

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Logo */}
        <img src={assets.logo} alt="PocketBilliard" className="h-16 w-auto mx-auto mb-8" />
        
        {/* Loading Spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
        </div>
        
        {/* Loading Text */}
        <p className="mt-6 text-gray-600 text-lg font-medium">Loading PocketBilliard...</p>
        <p className="mt-2 text-gray-400 text-sm">Please wait while we prepare your experience</p>
        
        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  )
}

export default Loading
