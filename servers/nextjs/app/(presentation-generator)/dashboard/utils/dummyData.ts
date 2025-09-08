import { EnhancedPresentation } from '../types';

// Generate random presentation data for demonstration
export const generateDummyPresentations = (): EnhancedPresentation[] => {
  const titles = [
    "Navigating the Digital World",
    "Gamma Tips & Tricks",
    "Q3 Financial Report",
    "Marketing Strategy 2024",
    "Product Roadmap Overview",
    "Team Performance Review",
    "Customer Success Stories",
    "Annual Business Plan",
    "Technology Innovation",
    "Data Analytics Dashboard",
    "Project Kickoff Meeting",
    "Brand Guidelines Update",
    "Sales Pipeline Review",
    "User Experience Research",
    "Competitive Analysis",
    "Budget Planning Session",
    "Training Workshop",
    "Feature Launch Plan",
    "Market Research Findings",
    "Company Culture Deck"
  ];

  const thumbnailColors = [
    "bg-gradient-to-br from-purple-500 to-blue-600",
    "bg-gradient-to-br from-emerald-500 to-teal-600", 
    "bg-gradient-to-br from-orange-500 to-red-600",
    "bg-gradient-to-br from-pink-500 to-rose-600",
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-yellow-500 to-orange-600",
    "bg-gradient-to-br from-green-500 to-emerald-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600"
  ];

  const presentations: EnhancedPresentation[] = [];

  for (let i = 0; i < 15; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const lastViewed = new Date();
    lastViewed.setHours(lastViewed.getHours() - Math.floor(Math.random() * 72));
    
    const updatedDate = new Date(Math.max(createdDate.getTime(), lastViewed.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000));

    presentations.push({
      id: `presentation-${i + 1}`,
      title: titles[i % titles.length],
      created_at: createdDate.toISOString(),
      updated_at: updatedDate.toISOString(),
      last_viewed: lastViewed.toISOString(),
      thumbnail: thumbnailColors[i % thumbnailColors.length],
      type: Math.random() > 0.8 ? 'video' : 'slide',
      is_favorite: Math.random() > 0.7,
      privacy: 'private',
      created_by_current_user: true,
      n_slides: Math.floor(Math.random() * 20) + 5,
      duration: Math.random() > 0.8 ? `${Math.floor(Math.random() * 15) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined
    });
  }

  return presentations;
};

export const filterPresentationsByTab = (presentations: EnhancedPresentation[], tab: 'all' | 'recent' | 'created' | 'favorites'): EnhancedPresentation[] => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  switch (tab) {
    case 'all':
      return presentations;
    case 'recent':
      return presentations.filter(p => new Date(p.last_viewed) >= sevenDaysAgo);
    case 'created':
      return presentations.filter(p => p.created_by_current_user);
    case 'favorites':
      return presentations.filter(p => p.is_favorite);
    default:
      return presentations;
  }
};

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};
