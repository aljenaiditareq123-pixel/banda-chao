'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Globe, X, Copy, Check } from 'lucide-react';
import { FaWeixin, FaTwitter, FaWhatsapp } from 'react-icons/fa';

export default function SocialHub() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CONTACTS = [
    {
      id: 'wechat',
      icon: FaWeixin,
      label: 'WeChat',
      color: 'bg-[#07C160]',
      value: 'wx_banda_maker_01',
      action: 'Add Contact',
      preview: 'Latest Moment: "Just finished a batch of Silk Scarves! 🎨"'
    },
    {
      id: 'whatsapp',
      icon: FaWhatsapp,
      label: 'WhatsApp',
      color: 'bg-[#25D366]',
      value: '+971 50 123 4567',
      action: 'Start Chat',
      preview: 'Available for custom orders'
    },
    {
      id: 'twitter',
      icon: FaTwitter,
      label: 'X / Twitter',
      color: 'bg-black border border-white/20',
      value: '@BandaArtisan',
      action: 'Follow',
      preview: 'Pinned: "My journey at BYD started 5 years ago..."'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider px-2">
        Connect Directly
      </h3>

      {/* Social Cards */}
      <div className="grid gap-3">
        {CONTACTS.map((contact) => (
          <motion.div
            key={contact.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal(contact.id)}
            className="relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${contact.color} text-white shrink-0`}>
                <contact.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white">{contact.label}</h4>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                    Online
                  </span>
                </div>
                <p className="text-sm text-white/60 italic truncate">
                  {contact.preview}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Bar (Sticky Bottom for Mobile) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-amber-500 rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center text-black"
          onClick={() => setActiveModal('wechat')}
        >
          <MessageCircle className="w-7 h-7" />
        </motion.button>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {CONTACTS.map((contact) => {
                if (contact.id !== activeModal) return null;
                return (
                  <div key={contact.id} className="text-center space-y-6">
                    <div className={`w-20 h-20 mx-auto rounded-full ${contact.color} flex items-center justify-center shadow-lg`}>
                      <contact.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{contact.label}</h3>
                      <p className="text-white/50">Scan or copy to connect instantly</p>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl">
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-black/20 text-xs">
                        [QR Code Placeholder]
                      </div>
                    </div>

                    {/* Copy ID Section */}
                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/10">
                      <code className="text-amber-500 font-mono text-lg">{contact.value}</code>
                      <button
                        onClick={() => handleCopy(contact.value)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>

                    <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                      Open {contact.label} App
                    </button>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
