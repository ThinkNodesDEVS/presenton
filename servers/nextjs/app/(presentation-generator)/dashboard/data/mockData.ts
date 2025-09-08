import { PresentationResponse } from "@/app/(presentation-generator)/services/api/dashboard";

// Mock slide content for presentation previews
const mockSlides = [
  {
    id: "1",
    title: "Welcome to AI Revolution",
    content: "The future of artificial intelligence is here",
    layout: "title-content"
  },
  {
    id: "2", 
    title: "Market Analysis 2024",
    content: "Comprehensive market insights and trends",
    layout: "chart-content"
  },
  {
    id: "3",
    title: "Growth Strategy",
    content: "Strategic roadmap for sustainable growth",
    layout: "bullet-points"
  }
];

// Generate mock presentation data
export const generateMockPresentations = (count: number = 12): (PresentationResponse & { 
  isFavorite?: boolean; 
  lastViewed?: string; 
  createdBy?: string;
  status?: 'private' | 'public';
})[] => {
  const topics = [
    "AI Revolution in Healthcare",
    "Digital Transformation Strategy",
    "Climate Change Solutions",
    "Future of Remote Work",
    "Quantum Computing Breakthrough", 
    "Sustainable Energy Roadmap",
    "Blockchain in Finance",
    "Machine Learning Applications",
    "IoT and Smart Cities",
    "Cybersecurity Trends 2024",
    "Space Technology Advancements",
    "Green Technology Innovation",
    "Virtual Reality in Education",
    "Autonomous Vehicle Development",
    "Biotechnology Research",
    "Cloud Computing Evolution",
    "Social Media Analytics",
    "E-commerce Growth Strategies",
    "Data Privacy Regulations",
    "5G Network Implementation"
  ];

  const thumbnailColors = [
    "bg-gradient-to-br from-blue-400 to-purple-600",
    "bg-gradient-to-br from-green-400 to-blue-500", 
    "bg-gradient-to-br from-pink-400 to-red-500",
    "bg-gradient-to-br from-yellow-400 to-orange-500",
    "bg-gradient-to-br from-indigo-400 to-purple-500",
    "bg-gradient-to-br from-teal-400 to-green-500",
    "bg-gradient-to-br from-rose-400 to-pink-500",
    "bg-gradient-to-br from-cyan-400 to-blue-500"
  ];

  const getRandomDate = (daysBack: number) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date.toISOString();
  };

  const getLastViewedText = (createdDate: string) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffDays === 0) {
      return diffHours === 0 ? "Last viewed just now" : `Last viewed ${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Last viewed yesterday";
    } else {
      return `Last viewed ${diffDays} days ago`;
    }
  };

  return Array.from({ length: count }, (_, i) => {
    const createdDate = getRandomDate(30);
    const updatedDate = getRandomDate(7);
    const slideCount = Math.floor(Math.random() * 15) + 5; // 5-20 slides
    
    return {
      id: `mock-${i + 1}`,
      title: topics[i % topics.length],
      created_at: createdDate,
      updated_at: updatedDate,
      data: null,
      file: `presentation-${i + 1}.pptx`,
      n_slides: slideCount,
      prompt: `Create a professional presentation about ${topics[i % topics.length]}`,
      summary: `A comprehensive overview of ${topics[i % topics.length]} with key insights and actionable recommendations.`,
      theme: "modern-gradient",
      titles: [`${topics[i % topics.length]} - Overview`, "Key Points", "Analysis", "Recommendations"],
      user_id: "current-user-123",
      vector_store: null,
      thumbnail: thumbnailColors[i % thumbnailColors.length],
      slides: Array.from({ length: Math.min(3, slideCount) }, (_, slideIndex) => ({
        ...mockSlides[slideIndex % mockSlides.length],
        id: `slide-${i}-${slideIndex}`,
        title: slideIndex === 0 ? topics[i % topics.length] : mockSlides[slideIndex % mockSlides.length].title
      })),
      // Enhanced properties for filtering
      isFavorite: Math.random() > 0.7, // ~30% chance of being favorite
      lastViewed: getLastViewedText(createdDate),
      createdBy: "you",
      status: Math.random() > 0.3 ? 'private' : 'public' as 'private' | 'public'
    };
  });
};

// Filter presentations by tab
export const filterPresentations = (
  presentations: (PresentationResponse & { 
    isFavorite?: boolean; 
    lastViewed?: string; 
    createdBy?: string;
  })[], 
  filter: "all" | "recent" | "created" | "favorites"
) => {
  switch (filter) {
    case "recent":
      // Sort by most recent update and take top 50%
      return presentations
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, Math.ceil(presentations.length * 0.6));
    
    case "created":
      // Filter by created by current user
      return presentations.filter(p => p.createdBy === "you");
    
    case "favorites":
      // Filter by favorites
      return presentations.filter(p => p.isFavorite);
    
    case "all":
    default:
      return presentations;
  }
};

export const toggleFavorite = (
  presentations: (PresentationResponse & { isFavorite?: boolean })[],
  presentationId: string
): (PresentationResponse & { isFavorite?: boolean })[] => {
  return presentations.map(p => 
    p.id === presentationId 
      ? { ...p, isFavorite: !p.isFavorite }
      : p
  );
};
