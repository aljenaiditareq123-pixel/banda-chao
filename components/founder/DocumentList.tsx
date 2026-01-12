'use client';

import { useState } from 'react';

interface Document {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'strategic' | 'legal' | 'operational';
  lastUpdated: string;
  size: string;
}

interface DocumentListProps {
  compact?: boolean;
}

export default function DocumentList({ compact = false }: DocumentListProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Core Banda Chao documents
  const documents: Document[] = [
    {
      id: 'legal-positioning',
      title: 'Legal Positioning Document',
      description: 'UAE neutrality, RAKEZ advantages, and global legal framework',
      icon: '⚖️',
      category: 'legal',
      lastUpdated: '2024-11-20',
      size: '12 KB'
    },
    {
      id: 'investor-pitch',
      title: 'Investor Pitch Deck',
      description: 'Strategic positioning, market opportunity, and financial projections',
      icon: '📊',
      category: 'strategic',
      lastUpdated: '2024-11-19',
      size: '8 KB'
    },
    {
      id: 'about-page',
      title: 'Official About Page',
      description: 'Platform mission, vision, and three-culture approach',
      icon: '📄',
      category: 'strategic',
      lastUpdated: '2024-11-18',
      size: '6 KB'
    },
    {
      id: 'strategic-plan',
      title: 'Strategic Plan 2025-2027',
      description: 'Three-phase development roadmap and growth targets',
      icon: '🎯',
      category: 'strategic',
      lastUpdated: '2024-11-17',
      size: '15 KB'
    },
    {
      id: 'founder-vision',
      title: 'Founder Vision Statement',
      description: 'Tariq Al-Janaidi\'s personal mission and platform philosophy',
      icon: '💭',
      category: 'strategic',
      lastUpdated: '2024-11-16',
      size: '5 KB'
    },
    {
      id: 'competitive-advantage',
      title: 'Competitive Advantage Analysis',
      description: 'Market differentiation and unique value proposition',
      icon: '🏆',
      category: 'strategic',
      lastUpdated: '2024-11-15',
      size: '10 KB'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strategic':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'legal':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'operational':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDoc(doc);
  };

  return (
    <>
      <div className={`space-y-${compact ? '2' : '3'}`}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer group ${
              compact ? 'p-2' : 'p-3'
            }`}
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="flex items-start gap-3">
              <span className={compact ? 'text-sm' : 'text-base'}>
                {doc.icon}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`font-medium text-gray-900 dark:text-white ${
                    compact ? 'text-xs' : 'text-sm'
                  }`}>
                    {doc.title}
                  </h4>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </span>
                </div>
                
                <p className={`text-gray-600 dark:text-gray-300 mb-2 ${
                  compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-2'
                }`}>
                  {doc.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-gray-400 dark:text-gray-500 ${
                    compact ? 'text-xs' : 'text-xs'
                  }`}>
                    {formatDate(doc.lastUpdated)}
                  </span>
                  <span className={`text-gray-400 dark:text-gray-500 ${
                    compact ? 'text-xs' : 'text-xs'
                  }`}>
                    {doc.size}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Hover indicator */}
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedDoc.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDoc.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 mb-6">
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📄</span>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Document Preview
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  This document contains the core strategic information for Banda Chao.
                  In a full implementation, the document content would be displayed here.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>📅 Updated: {formatDate(selectedDoc.lastUpdated)}</span>
                  <span>📊 Size: {selectedDoc.size}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(selectedDoc.category)}`}>
                    {selectedDoc.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // In a real app, this would open the document for editing
                  alert(`Opening ${selectedDoc.title} for editing...`);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Edit Document
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
