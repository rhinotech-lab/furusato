
import { Business, Comment, ImageEntity, Municipality, Product, User, ImageStatus, Notification, ImageVersion, Project } from "../types";

export const PRODUCT_GENRES = ["肉類", "魚介類", "果物", "野菜", "米・パン", "菓子", "飲料", "酒類", "惣菜", "日用品", "工芸品", "その他"];

const getRelDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

// localStorage永続化ヘルパー
const STORAGE_PREFIX = 'furusato_db_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`, e);
  }
}

export const PORTALS = [
  { id: 'rakuten', label: '楽', full: '楽天', color: 'bg-red-500' },
  { id: 'choice', label: 'チ', full: 'チョイス', color: 'bg-emerald-500' },
  { id: 'satofull', label: 'さ', full: 'さとふる', color: 'bg-orange-500' },
  { id: 'furunavi', label: 'ふ', full: 'ふるなび', color: 'bg-blue-500' }
];

const DEFAULT_MUNICIPALITIES: Municipality[] = [
  { id: 1, name: "北海道札幌市", code: "011002" },
  { id: 3, name: "福岡県福岡市", code: "401307" }
];

export let MUNICIPALITIES: Municipality[] = loadFromStorage('municipalities', DEFAULT_MUNICIPALITIES);

export const ADMIN_USERS: User[] = [
  { id: 1, email: "admin@example.com", name: "管理太郎", role: "super_admin" },
  { id: 2, email: "creator@example.com", name: "制作花子", role: "creator" }
];

export const MUNICIPALITY_USERS: User[] = [
  { id: 3, municipality_id: 1, email: "sapporo@example.com", name: "札幌担当", role: "municipality_user" },
  { id: 5, municipality_id: 3, email: "fukuoka@example.com", name: "福岡担当", role: "municipality_user" }
];

export const BUSINESS_USERS: User[] = [
  { id: 101, business_id: 1, email: "farm@example.com", name: "ファーム担当", role: "business_user" },
  { id: 102, business_id: 2, email: "suisan@example.com", name: "札幌水産担当", role: "business_user" },
  { id: 103, business_id: 3, email: "ichigo@example.com", name: "博多フルーツ担当", role: "business_user" }
];

// 全ユーザーを統合
export const ALL_USERS: User[] = [
  ...ADMIN_USERS,
  ...MUNICIPALITY_USERS,
  ...BUSINESS_USERS
];

// IDとパスワードのマッピング（開発用：本番ではハッシュ化）
export const USER_CREDENTIALS: Record<number, string> = {
  1: "admin123",      // 管理太郎
  2: "creator123",    // 制作花子
  3: "sapporo123",    // 札幌担当
  5: "fukuoka123",    // 福岡担当
  101: "farm123",     // ファーム担当
  102: "suisan123",   // 札幌水産担当
  103: "ichigo123"    // 博多フルーツ担当
};

// IDでユーザーを検索
export const getUserById = (id: number): User | undefined => {
  return ALL_USERS.find(u => u.id === id);
};

// IDとパスワードで認証
export const authenticateUser = (id: number, password: string): User | null => {
  const user = getUserById(id);
  if (!user) return null;
  
  const correctPassword = USER_CREDENTIALS[id];
  if (!correctPassword || correctPassword !== password) return null;
  
  return user;
};

const DEFAULT_PROJECTS: Project[] = [
  { 
    id: 1, 
    name: "冬の特産品キャンペーン2025", 
    municipality_id: 1, 
    status: 'in_progress', 
    collection_deadline: getRelDate(10), 
    deadline: getRelDate(30), 
    created_at: "2025-01-01" 
  },
  { 
    id: 2, 
    name: "新生活応援特集", 
    municipality_id: 3, 
    status: 'not_started', 
    collection_deadline: getRelDate(40), 
    deadline: getRelDate(60), 
    created_at: "2025-01-15" 
  },
  { 
    id: 3, 
    name: "秋の感謝祭2024", 
    municipality_id: 1, 
    status: 'completed', 
    collection_deadline: getRelDate(-20), 
    deadline: getRelDate(-10), 
    created_at: "2024-09-01" 
  }
];

export let PROJECTS: Project[] = loadFromStorage('projects', DEFAULT_PROJECTS);

const DEFAULT_BUSINESSES: Business[] = [
  { id: 1, municipality_id: 1, name: "ファーム北海道", code: "B-0001", category: "肉類", portals: ["rakuten", "choice", "satofull", "furunavi"] },
  { id: 2, municipality_id: 1, name: "札幌水産", code: "B-0002", category: "魚介類", portals: ["rakuten", "choice"] },
  { id: 3, municipality_id: 3, name: "博多フルーツガーデン", code: "B-0003", category: "果物", portals: ["rakuten", "choice", "satofull"] }
];

export let BUSINESSES: Business[] = loadFromStorage('businesses', DEFAULT_BUSINESSES);

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, business_id: 1, project_id: 1, name: "特選ジンギスカンセット 1.2kg", genre: "肉類", description: "北海道産ラム肉使用。秘伝のタレ付き。", product_code: "P-GEN-01", deadline: getRelDate(-2), unread_comments_count: 0, donation_amount: 15000, temperature_range: 'refrigerated', has_materials: true, portals: ["rakuten", "choice", "satofull", "furunavi"] },
  { id: 2, business_id: 2, project_id: 1, name: "いくら醤油漬け 500g", genre: "魚介類", description: "新鮮な鮭卵を使用。", product_code: "P-SEA-01", deadline: getRelDate(3), unread_comments_count: 2, donation_amount: 18000, temperature_range: 'frozen', has_materials: true, portals: ["rakuten", "choice"] },
  { id: 3, business_id: 3, project_id: 2, name: "博多あまおう 4パック", genre: "果物", description: "大粒で甘い福岡ブランド苺。", product_code: "P-FRU-01", deadline: getRelDate(5), unread_comments_count: 0, donation_amount: 12000, temperature_range: 'refrigerated', has_materials: true, portals: ["rakuten", "choice", "satofull"] }
];

export let PRODUCTS: Product[] = loadFromStorage('products', DEFAULT_PRODUCTS);

const DEFAULT_IMAGES: ImageEntity[] = [
  {
    id: 1,
    product_id: 1,
    title: "2026年2月　肉類系",
    external_url: "https://item.rakuten.co.jp/example-shop/011002/",
    created_by_admin_id: 2,
    created_at: "2026-02-01T10:00:00",
    versions: [
      {
        id: 1001,
        image_id: 1,
        version_number: 1,
        file_path: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80",
        status: 'approved',
        submitted_at: "2026-02-01T15:00:00",
        created_at: "2026-02-01T15:00:00"
      },
      {
        id: 10012,
        image_id: 1,
        version_number: 2,
        file_path: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80",
        status: 'rejected',
        submitted_at: "2026-02-03T12:00:00",
        created_at: "2026-02-03T12:00:00"
      },
      {
        id: 10013,
        image_id: 1,
        version_number: 3,
        file_path: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80",
        status: 'pending_review',
        submitted_at: "2026-02-05T15:00:00",
        created_at: "2026-02-05T15:00:00"
      }
    ]
  },
  {
    id: 4,
    product_id: 2,
    title: "2026年2月　魚介類系",
    created_by_admin_id: 2,
    created_at: "2026-02-03T11:00:00",
    versions: [
      {
        id: 1004,
        image_id: 4,
        version_number: 1,
        file_path: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1000&q=80",
        status: 'pending_review',
        submitted_at: "2026-02-03T15:30:00",
        created_at: "2026-02-03T15:30:00"
      }
    ]
  },
  {
    id: 5,
    product_id: 3,
    title: "2026年3月　果物系",
    created_by_admin_id: 2,
    created_at: "2026-03-01T11:30:00",
    versions: [
      {
        id: 1005,
        image_id: 5,
        version_number: 1,
        file_path: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&q=80",
        status: 'approved',
        submitted_at: "2026-03-01T16:00:00",
        created_at: "2026-03-01T16:00:00"
      }
    ]
  },
  {
    id: 6,
    product_id: 1,
    title: "2026年1月　肉類系",
    created_by_admin_id: 2,
    created_at: "2026-01-15T10:00:00",
    versions: [
      {
        id: 1006,
        image_id: 6,
        version_number: 1,
        file_path: "https://images.unsplash.com/photo-1484723088339-fe28233e562e?w=1000&q=80",
        status: 'pending_review',
        submitted_at: "2026-01-15T11:00:00",
        created_at: "2026-01-15T11:00:00"
      }
    ]
  },
  {
    id: 7,
    product_id: 2,
    title: "2026年1月　魚介類系",
    created_by_admin_id: 2,
    created_at: "2026-01-20T10:00:00",
    versions: [
      {
        id: 1007,
        image_id: 7,
        version_number: 1,
        file_path: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1000&q=80",
        status: 'revising',
        submitted_at: "2026-01-20T11:00:00",
        created_at: "2026-01-20T11:00:00"
      }
    ]
  }
];

let images: ImageEntity[] = loadFromStorage('images', DEFAULT_IMAGES);

const DEFAULT_COMMENTS: Comment[] = [
  { id: 1, image_id: 1, commenter_type: 'admin', commenter_id: 2, commenter_name: "制作花子", body: "最新の修正版です。ご確認ください。", created_at: "2025-01-10T15:05:00" },
  { id: 2, image_id: 3, commenter_type: 'municipality', commenter_id: 5, commenter_name: "福岡担当", body: "右下の『予約』の文字をもっと大きくしてください。", created_at: "2025-01-11T09:00:00" }
];

let comments: Comment[] = loadFromStorage('comments', DEFAULT_COMMENTS);

export const mockDb = {
  getMunicipalities: () => MUNICIPALITIES,
  getMunicipalityById: (id: number) => MUNICIPALITIES.find(m => m.id === id),
  getBusinesses: () => BUSINESSES,
  getBusinessById: (id: number) => BUSINESSES.find(b => b.id === id),
  getProjects: () => PROJECTS,
  getProjectById: (id: number) => PROJECTS.find(p => p.id === id),
  getProducts: () => PRODUCTS,
  getProductById: (id: number) => PRODUCTS.find(p => p.id === id),
  getImages: () => images,
  getImageById: (id: number) => images.find(img => img.id === id),
  
  addMunicipality: (data: any) => {
    const maxId = MUNICIPALITIES.reduce((max, m) => Math.max(max, m.id), 0);
    const newMuni = { ...data, id: maxId + 1 };
    MUNICIPALITIES.push(newMuni);
    saveToStorage('municipalities', MUNICIPALITIES);
    return newMuni;
  },

  updateMunicipality: (id: number, data: any) => {
    const index = MUNICIPALITIES.findIndex(m => m.id === id);
    if (index !== -1) {
      MUNICIPALITIES[index] = { ...MUNICIPALITIES[index], ...data };
      saveToStorage('municipalities', MUNICIPALITIES);
    }
  },
  
  addBusiness: (data: any) => {
    const maxId = BUSINESSES.reduce((max, b) => Math.max(max, b.id), 0);
    const newBiz = { ...data, id: maxId + 1 };
    BUSINESSES.push(newBiz);
    saveToStorage('businesses', BUSINESSES);
    return newBiz;
  },

  updateBusiness: (id: number, data: any) => {
    const index = BUSINESSES.findIndex(b => b.id === id);
    if (index !== -1) {
      BUSINESSES[index] = { ...BUSINESSES[index], ...data };
      saveToStorage('businesses', BUSINESSES);
    }
  },

  deleteBusiness: (id: number) => {
    const index = BUSINESSES.findIndex(b => b.id === id);
    if (index !== -1) {
      BUSINESSES.splice(index, 1);
      saveToStorage('businesses', BUSINESSES);
    }
  },

  addProduct: (data: any) => {
    const maxId = PRODUCTS.reduce((max, p) => Math.max(max, p.id), 0);
    const newProd = { ...data, id: maxId + 1 };
    PRODUCTS.push(newProd);
    saveToStorage('products', PRODUCTS);
    return newProd;
  },

  updateProduct: (id: number, data: any) => {
    const index = PRODUCTS.findIndex(p => p.id === id);
    if (index !== -1) {
      PRODUCTS[index] = { ...PRODUCTS[index], ...data };
      saveToStorage('products', PRODUCTS);
    }
  },

  addProject: (data: any) => {
    const maxId = PROJECTS.reduce((max, p) => Math.max(max, p.id), 0);
    const newProj = { ...data, id: maxId + 1, created_at: new Date().toISOString().split('T')[0] };
    PROJECTS.push(newProj);
    saveToStorage('projects', PROJECTS);
    return newProj;
  },

  updateProject: (id: number, data: any) => {
    const index = PROJECTS.findIndex(p => p.id === id);
    if (index !== -1) {
      PROJECTS[index] = { ...PROJECTS[index], ...data };
      saveToStorage('projects', PROJECTS);
    }
  },

  addImage: (data: any) => {
    const now = new Date().toISOString();
    const id = Date.now();
    const newImage: ImageEntity = {
      id,
      product_id: data.product_id,
      title: data.title,
      external_url: data.external_url,
      created_by_admin_id: data.created_by_admin_id,
      created_at: now,
      versions: [{
        id: Date.now() + 1,
        image_id: id,
        version_number: 1,
        file_path: data.file_path,
        status: 'pending_review',
        submitted_at: now,
        created_at: now
      }]
    };
    images.push(newImage);
    saveToStorage('images', images);
    return newImage;
  },

  updateImageExternalUrl: (id: number, url: string) => {
    const img = images.find(i => i.id === id);
    if (img) {
      img.external_url = url;
      saveToStorage('images', images);
    }
  },
  
  updateVersionStatus: (imageId: number, versionId: number, status: ImageStatus) => {
    const img = images.find(i => i.id === imageId);
    if (img) {
      const ver = img.versions.find(v => v.id === versionId);
      if (ver) {
        ver.status = status;
        saveToStorage('images', images);
      }
    }
  },

  getCommentsByImageId: (imageId: number) => comments.filter(c => c.image_id === imageId),
  addComment: (data: any) => {
    const newComment = { ...data, id: Date.now(), created_at: new Date().toISOString() };
    comments.push(newComment);
    saveToStorage('comments', comments);
    return newComment;
  },
  deleteComment: (id: number) => {
    comments = comments.filter(c => c.id !== id);
    saveToStorage('comments', comments);
  },
  getNotifications: () => [],
  markNotificationsAsRead: () => {}
};
