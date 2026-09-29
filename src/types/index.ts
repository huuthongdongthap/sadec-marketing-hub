export interface Experience {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  region: 'Sa Đéc' | 'Tam Nông' | 'Cao Lãnh' | 'Hồng Ngự' | 'Lai Vung' | 'Lấp Vò';
  season: string;
  bestMonths: number[];
  price: number;
  currency: 'VND';
  duration: string;
  groupSizeLimit: number;
  highlightImages: string[];
  description: string;
  culturalStory: string;
  itinerary: {
    time: string;
    activity: string;
    description: string;
  }[];
  included: string[];
  localHost: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
  tags: string[];
}

export interface PartnerAgency {
  id: string;
  name: string;
  tier: 'Gold' | 'Silver' | 'Copper';
  city: string;
  province: string;
  specialization: string[];
  logo: string;
  joinedDate: string;
  projectsCompleted: number;
  mediaAssetsContributed: number;
}

export interface MediaAsset {
  id: string;
  title: string;
  category: 'Mùa Nước Nổi' | 'Làng Hoa Sa Đéc' | 'Di Sản Kiến Trúc' | 'Ẩm Thực Bản Địa' | 'Làng Nghề Truyền Thống';
  resolution: '4K' | '1080p' | 'High-Res Photo';
  format: 'MP4' | 'MOV' | 'RAW' | 'JPG';
  thumbnailUrl: string;
  downloadUrl: string;
  duration?: string;
  license: 'CC-BY-Mekong' | 'Hub-Exclusive';
  location: string;
  cameraInfo: string;
  tags: string[];
}

export interface MarTechTool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'AI Content' | 'Automation' | 'Booking & CRM' | 'Vibe Coding';
  status: 'Ready' | 'Beta' | 'Coming Soon';
  icon: string;
  endpoint?: string;
}
