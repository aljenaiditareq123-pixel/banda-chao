'use client'

import React, { useState, useEffect } from 'react'
import { createGroupBuy } from '@/actions/createGroupBuy'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName?: string
  locale?: string
}

export default function ShareModal({ isOpen, onClose, productId, productName = '', locale = 'en' }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [groupBuyId, setGroupBuyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Create group buy session when modal opens
      const createGroupBuySession = async () => {
        setIsLoading(true)
        try {
          const result = await createGroupBuy(productId)
          setGroupBuyId(result.groupBuyId)
          
          // Generate share link with group buy ID
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
          const link = `${baseUrl}/products/${productId}?groupBuy=${result.groupBuyId}`
          setShareLink(link)
        } catch (error) {
          console.error('Failed to create group buy session:', error)
          // Fallback to basic link if server action fails
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
          const link = `${baseUrl}/products/${productId}?groupBuy=true`
          setShareLink(link)
        } finally {
          setIsLoading(false)
        }
      }

      createGroupBuySession()
    } else {
      // Reset when modal closes
      setGroupBuyId(null)
      setShareLink('')
      setCopied(false)
    }
  }, [isOpen, productId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareToWhatsApp = () => {
    const message = locale === 'ar' 
      ? `انضم معي للشراء الجماعي: ${productName || 'منتج رائع'}`
      : locale === 'zh'
      ? `和我一起团购：${productName || '很棒的产品'}`
      : `Join me for group buy: ${productName || 'Amazing product'}`
    const url = `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareLink)}`
    window.open(url, '_blank')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`
    window.open(url, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'ar' ? 'ادعُ صديقك' : locale === 'zh' ? '邀请朋友' : 'Invite Your Friend'}
          </h2>
          <p className="text-gray-600 text-sm">
            {locale === 'ar' 
              ? 'شارك الرابط مع صديقك واحصلا على خصم عند الشراء معاً'
              : locale === 'zh'
              ? '与朋友分享链接，一起购买可享受折扣'
              : 'Share the link with your friend and get a discount when buying together'}
          </p>
        </div>

        {/* Share Link Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'رابط المشاركة' : locale === 'zh' ? '分享链接' : 'Share Link'}
          </label>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">
                  {locale === 'ar' ? 'جاري إنشاء رابط المشاركة...' : locale === 'zh' ? '正在生成分享链接...' : 'Creating share link...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                onClick={copyToClipboard}
                disabled={!shareLink}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : shareLink
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {copied 
                  ? (locale === 'ar' ? '✓ تم النسخ' : locale === 'zh' ? '✓ 已复制' : '✓ Copied')
                  : (locale === 'ar' ? 'نسخ' : locale === 'zh' ? '复制' : 'Copy')
                }
              </button>
            </div>
          )}
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {locale === 'ar' ? 'أو شارك مباشرة عبر:' : locale === 'zh' ? '或直接通过以下方式分享：' : 'Or share directly via:'}
          </p>
          
          {/* WhatsApp Button */}
          <button
            onClick={shareToWhatsApp}
            disabled={isLoading || !shareLink}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all transform shadow-lg ${
              isLoading || !shareLink
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 active:scale-95 hover:shadow-xl'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>WhatsApp</span>
          </button>

          {/* Facebook Button */}
          <button
            onClick={shareToFacebook}
            disabled={isLoading || !shareLink}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all transform shadow-lg ${
              isLoading || !shareLink
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 hover:shadow-xl'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </div>
    </div>
  )
}

