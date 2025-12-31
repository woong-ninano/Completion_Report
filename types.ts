
export interface ContentItem {
  id?: string;
  title: string;
  description: string;
  subDescription?: string;
  images: string[];
}

export interface SiteConfig {
  headerLogoUrl: string;
  headerProjectTitle: string;
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc1: string;
  heroDesc2: string;
  contentItems: ContentItem[];
}

export interface SectionData {
  id: string;
  items: ContentItem[];
}

export interface MetricData {
  name: string;
  value: number;
}
