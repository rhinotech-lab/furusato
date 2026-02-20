import { User, ImageEntity } from '../types';
import { mockDb } from '../services/mockDb';

/**
 * 画像を承認できるかチェック
 * - システム管理者: すべて承認可能
 * - 自治体ユーザー: 自分の自治体の商品のみ承認可能
 * - 事業者ユーザー: 自分の商品のみ承認可能
 * - 制作者: 承認不可
 */
export const canApproveImage = (user: User | null, image: ImageEntity): boolean => {
  if (!user) return false;
  
  // システム管理者はすべて承認可能
  if (user.role === 'super_admin') return true;
  
  // 制作者は承認不可
  if (user.role === 'creator') return false;
  
  // 自治体ユーザー: 自分の自治体の商品のみ承認可能
  if (user.role === 'municipality_user' && user.municipality_id) {
    const product = mockDb.getProductById(image.product_id);
    if (!product) return false;
    const business = mockDb.getBusinessById(product.business_id);
    return business?.municipality_id === user.municipality_id;
  }
  
  // 事業者ユーザー: 自分の商品のみ承認可能
  if (user.role === 'business_user' && user.business_id) {
    const product = mockDb.getProductById(image.product_id);
    return product?.business_id === user.business_id;
  }
  
  return false;
};

/**
 * 画像をアップロードできるかチェック
 * - システム管理者: アップロード可能
 * - 制作者: アップロード可能
 * - その他: アップロード不可
 */
export const canUploadImage = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'super_admin' || user.role === 'creator';
};

/**
 * チャットを表示できるかチェック
 * - システム管理者: 表示可能
 * - 制作者: 表示可能
 * - 自治体ユーザー: 表示可能
 * - 事業者ユーザー: 表示不可
 */
export const canViewChat = (user: User | null): boolean => {
  if (!user) return false;
  return user.role !== 'business_user';
};

/**
 * チャットを送信できるかチェック
 * - システム管理者: 送信可能
 * - 制作者: 送信可能
 * - 自治体ユーザー: 送信可能
 * - 事業者ユーザー: 送信不可
 */
export const canSendChat = (user: User | null): boolean => {
  if (!user) return false;
  return user.role !== 'business_user';
};
