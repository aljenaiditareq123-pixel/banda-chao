'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Package, Truck, MapPin, Home, Plane } from 'lucide-react';

interface TrackingEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: Date | string;
  location?: string;
  completed: boolean;
  isCurrent?: boolean;
}

interface VisualTimelineProps {
  events: TrackingEvent[];
  locale: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Check className="w-5 h-5" />,
  PROCESSING: <Package className="w-5 h-5" />,
  PACKED: <Package className="w-5 h-5" />,
  SHIPPED: <Plane className="w-5 h-5" />,
  IN_TRANSIT: <Truck className="w-5 h-5" />,
  OUT_FOR_DELIVERY: <Truck className="w-5 h-5" />,
  DELIVERED: <Home className="w-5 h-5" />,
};

export default function VisualTimeline({ events, locale }: VisualTimelineProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-primary-600 dark:bg-primary-500"
          style={{
            height: `${(events.filter(e => e.completed).length / events.length) * 100}%`,
          }}
        />
      </div>

      {/* Events */}
      <div className="space-y-8">
        {events.map((event, index) => {
          const isCompleted = event.completed;
          const isCurrent = event.isCurrent;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              {/* Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : isCurrent
                    ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-500 text-primary-600 dark:text-primary-400 animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  statusIcons[event.status] || <Clock className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-semibold ${
                      isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : isCurrent
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {event.title}
                  </h3>
                  {isCurrent && (
                    <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                      {locale === 'ar' ? 'الحالي' : locale === 'zh' ? '当前' : 'Current'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {event.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(event.timestamp)}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
