
export type Role = 'super_admin' | 'creator' | 'municipality_user' | 'business_user';
export type ImageStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'revising';
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed';
export type CommenterType = 'admin' | 'municipality' | 'business';
export type TemperatureRange = 'normal' | 'refrigerated' | 'frozen';
export type AnnotationType = 'pin' | 'box' | 'arrow' | 'pen';

export interface Point {
  x: number;
  y: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  municipality_id?: number; // For municipality_user
  business_id?: number;     // For business_user
}

export interface Municipality {
  id: number;
  name: string;
  code: string;
}

export interface Business {
  id: number;
  municipality_id: number;
  name: string;
  code: string;
  category?: string;
  management_id?: string;
  contact_person?: string;
  contact_tel?: string;
  contact_email?: string;
  portals?: string[];
  notes?: string;
}

export interface Project {
  id: number;
  name: string;
  municipality_id: number;
  description?: string;
  status: ProjectStatus;
  collection_deadline?: string; // 素材回収期限
  deadline?: string;            // 掲載締切日
  created_at: string;
}

export interface Product {
  id: number;
  business_id: number;
  project_id?: number;
  name: string;
  description: string;
  genre?: string;
  product_code?: string;
  internal_memo?: string;
  external_url?: string;
  deadline?: string;
  unread_comments_count?: number;
  donation_amount?: number;
  temperature_range?: TemperatureRange;
  has_materials?: boolean;
  portals?: string[];
}

export interface ImageVersion {
  id: number;
  image_id: number;
  version_number: number;
  file_path: string;
  status: ImageStatus;
  submitted_at: string;
  created_at: string;
}

export interface ImageEntity {
  id: number;
  product_id: number;
  title: string;
  external_url?: string;
  created_by_admin_id: number;
  created_at: string;
  versions: ImageVersion[];
}

export interface Comment {
  id: number;
  image_id: number;
  commenter_type: CommenterType;
  commenter_id: number;
  commenter_name: string;
  body: string;
  created_at: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  path?: Point[];
  annotation_type?: AnnotationType;
  color?: string;
  pin_number?: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
