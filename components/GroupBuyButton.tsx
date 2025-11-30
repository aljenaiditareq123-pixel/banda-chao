'use client'

import React from 'react'

interface GroupBuyButtonProps {
  onClick?: () => void
  className?: string
}

export default function GroupBuyButton({ onClick, className = '' }: GroupBuyButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative
        px-6 py-3
        bg-gradient-to-r from-red-500 to-red-600
        hover:from-red-600 hover:to-red-700
        text-white
        font-bold
        text-lg
        rounded-lg
        shadow-lg
        hover:shadow-xl
        transform
        hover:scale-105
        active:scale-95
        transition-all
        duration-200
        ease-in-out
        flex
        items-center
        justify-center
        gap-2
        overflow-hidden
        ${className}
      `}
    >
      {/* Animated background effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      
      {/* Icon */}
      <span className="relative z-10 text-2xl">👥</span>
      
      {/* Text */}
      <span className="relative z-10">اشترِ مع صديق</span>
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-lg bg-red-400 opacity-0 hover:opacity-20 animate-pulse" />
    </button>
  )
}

