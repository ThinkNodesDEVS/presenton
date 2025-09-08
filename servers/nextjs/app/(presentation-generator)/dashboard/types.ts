export interface Presentation {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  type: 'video' | 'slide';
}

export interface PresentationFilter {
  type?: 'video' | 'slide';
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface EnhancedPresentation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_viewed: string;
  thumbnail: string;
  type: 'slide' | 'video';
  is_favorite: boolean;
  privacy: 'private' | 'public';
  created_by_current_user: boolean;
  n_slides?: number;
  duration?: string; // For video types
}

export type DashboardTab = 'all' | 'recent' | 'created' | 'favorites';
export type ViewMode = 'grid' | 'list';

export interface DashboardState {
  activeTab: DashboardTab;
  viewMode: ViewMode;
  presentations: EnhancedPresentation[];
  isLoading: boolean;
  error: string | null;
}