/**
 * Founder Assistant Types
 * Centralized type definitions for the Founder Console
 */

export type FounderOperatingMode = 
  | 'STRATEGY_MODE'
  | 'PRODUCT_MODE' 
  | 'TECH_MODE'
  | 'MARKETING_MODE'
  | 'CHINA_MODE';

export type FounderSlashCommand = 
  | '/plan'
  | '/tasks'
  | '/risks'
  | '/roadmap'
  | '/script'
  | '/email';

export type AssistantId =
  | 'founder'
  | 'tech'
  | 'guard'
  | 'commerce'
  | 'content'
  | 'logistics'
  | 'philosopher';

export type MessageRole = 'founder' | 'assistant';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
}

export interface FounderSession {
  id: string;
  title: string;
  summary: string;
  tasks: string[] | null;
  mode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantProfile {
  id: AssistantId;
  label: string;
  endpoint: string;
  title: string;
  description: string;
  placeholder: string;
  loadingText: string;
  openingMessage: string;
  headerGradient: string;
  assistantBubble: string;
}

export interface Assistant {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  emoji: string;
  gradient: string;
  isActive?: boolean;
}

export interface StatCard {
  title: string;
  titleAr: string;
  value: string;
  change: string;
  trend: TrendDirection;
  icon: string;
  accentColor?: AccentColor;
}

export interface QuickLink {
  title: string;
  titleAr: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
}

export interface SlashCommand {
  command: FounderSlashCommand;
  label: string;
  description: string;
}

export interface ModeConfig {
  label: string;
  icon: string;
  color: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  response?: string;
  message?: string;
  error?: string;
}

export interface FounderSessionsResponse {
  sessions: FounderSession[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Component Props Interfaces
export interface FounderChatPanelProps {
  assistantId: AssistantId | string;
  currentMode?: FounderOperatingMode;
}

export interface FounderAssistantsSidebarProps {
  selectedAssistant?: string;
  onAssistantSelect: (assistantId: string) => void;
}

export interface ModernFounderLayoutProps {
  initialAssistant?: string;
}

export interface StatCardProps {
  title: string;
  titleAr: string;
  value: string;
  change: string;
  trend: TrendDirection;
  icon: string;
  accentColor?: AccentColor;
}

export interface QuickLinkProps {
  title: string;
  titleAr: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
}

