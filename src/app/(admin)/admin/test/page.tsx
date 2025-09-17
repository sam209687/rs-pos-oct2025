import React from 'react'

export default function text() {
  return (
    <div className='w-full h-[100vh] bg-gray-700'>
        <div className='grid grid-cols-2 gap-2'>
          {/* Searchbar section */}
            <div className='bg-amber-700 h-[450px]'>

            </div>

            {/* Billing Section */}
            <div className='bg-amber-400 h-[450px]'>Billing Section</div>
        </div>

        <div className='mt-2'>
          {/* Live Cart  */}
          <div className='w-full h-[330px] bg-purple-700'>Live Cart</div>
        </div>
      
    </div>
  )
}
