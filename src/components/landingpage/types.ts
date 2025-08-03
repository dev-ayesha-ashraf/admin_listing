export type BannerType = "hero" | "category" | "promotional" | "advertisement";
export type BannerStatus = "active" | "inactive" | "scheduled" | "expired";

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: string;
  image: string;
  link?: string;
  buttonText?: string;
  bgGradient?: string;
  textColor: string;
  bannerType: BannerType;
  status: BannerStatus;
  order: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience: string[];
  isActive: boolean;
  clickCount: number;
  impressionCount: number;
  conversionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerFormData {
  title: string;
  subtitle: string;
  description: string;
  discount: string;
  image: string;
  link: string;
  buttonText: string;
  bgGradient: string;
  textColor: string;
  bannerType: BannerType;
  status: BannerStatus;
  order: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience: string[];
  isActive: boolean;
}
