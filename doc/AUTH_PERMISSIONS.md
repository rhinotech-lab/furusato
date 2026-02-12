# ログイン管理権限の実装計画

## 概要

現在のシステムは3つの役割（admin, municipality, business）を持っていますが、以下の4つの役割に再構成します：

1. **システム管理者（admin/super_admin）**: すべての機能にアクセス可能
2. **制作者（creator）**: 画像をアップロードする人（新規追加）
3. **自治体（municipality/municipality_user）**: 自分の自治体の制作の承認とチャットが可能
4. **事業者（business/business_user）**: 自分の登録されている商品画像の承認のみ可能、チャットは非表示

## 権限マトリックス

| 機能 | システム管理者 | 制作者 | 自治体 | 事業者 |
|------|--------------|--------|--------|--------|
| 画像アップロード | ✓ | ✓ | ✗ | ✗ |
| 画像承認（自分の自治体） | ✓ | ✗ | ✓ | ✗ |
| 画像承認（自分の商品） | ✓ | ✗ | ✗ | ✓ |
| チャット送信 | ✓ | ✓ | ✓ | ✗ |
| チャット表示 | ✓ | ✓ | ✓ | ✗ |
| ユーザー管理 | ✓ | ✗ | ✗ | ✗ |
| 組織管理 | ✓ | ✗ | ✗ | ✗ |

## 実装内容

### 1. バックエンドの変更

#### 1.1 データベースマイグレーション
- **ファイル**: `backend/database/migrations/2024_01_01_000001_create_users_table.php`
- **変更内容**: 
  - `type` enum に `'creator'` を追加
  - 変更前: `['admin', 'municipality', 'business']`
  - 変更後: `['admin', 'municipality', 'business', 'creator']`

#### 1.2 Userモデル
- **ファイル**: `backend/app/Models/User.php`
- **変更内容**: 
  - `isCreator()` メソッドを追加
  ```php
  public function isCreator(): bool
  {
      return $this->type === 'creator';
  }
  ```

#### 1.3 シーダー
- **ファイル**: `backend/database/seeders/DatabaseSeeder.php`
- **変更内容**: 
  - 制作者ユーザーのサンプルを追加
  ```php
  User::create([
      'name' => '制作者ユーザー',
      'email' => 'creator@example.com',
      'password' => Hash::make('password'),
      'type' => 'creator',
  ]);
  ```

### 2. フロントエンドの変更

#### 2.1 型定義
- **ファイル**: `types.ts`
- **変更内容**: 
  - `Role` 型は既に `'creator'` を含んでいるため変更不要
  - 現在の定義: `type Role = 'super_admin' | 'creator' | 'municipality_user' | 'business_user';`

#### 2.2 認証コンテキスト
- **ファイル**: `context/AuthContext.tsx`
- **変更内容**: 
  - `type === 'creator'` の場合に `role: 'creator'` を設定するようにマッピングを追加
  - 変更箇所: 63-64行目、88-89行目
  ```typescript
  role: response.user.type === 'admin' ? 'super_admin' : 
        response.user.type === 'municipality' ? 'municipality_user' : 
        response.user.type === 'business' ? 'business_user' : 
        'creator', // creator のマッピングを追加
  ```

#### 2.3 レイアウト・メニュー
- **ファイル**: `components/Layout.tsx`
- **変更内容**: 
  1. `getRoleLabel()` 関数に `'creator'` のラベルを追加（58-66行目）
     ```typescript
     case 'creator': return '制作者';
     ```
  2. メニュー項目の `roles` 配列に `'creator'` を適切に追加（72-79行目）
     - ホーム: `['super_admin', 'creator', 'municipality_user', 'business_user']`
     - 通知履歴: `['super_admin', 'creator', 'municipality_user', 'business_user']`
     - 自治体一覧: `['super_admin', 'creator']`
     - 事業者一覧: `['super_admin', 'municipality_user', 'creator']`
     - プロジェクト一覧: `['super_admin', 'creator', 'municipality_user']`
     - 商品一覧: `['super_admin', 'creator', 'municipality_user', 'business_user']`
     - 案件一覧: `['super_admin', 'creator', 'municipality_user', 'business_user']`
     - 設定: `['super_admin', 'creator', 'municipality_user', 'business_user']`

#### 2.4 画像詳細ページ（チャット機能の制御）
- **ファイル**: `pages/ImageDetail.tsx`
- **変更内容**: 
  1. 事業者ユーザーの場合、チャットセクション（284-344行目）を完全に非表示にする
     ```typescript
     {currentUser?.role !== 'business_user' && (
       <aside className="w-[360px] bg-white border-l border-slate-100 flex flex-col shadow-2xl z-30">
         {/* チャットセクション */}
       </aside>
     )}
     ```
  2. 承認機能の権限チェックを追加：
     - 自治体ユーザー: 自分の自治体の商品のみ承認可能
     - 事業者ユーザー: 自分の商品のみ承認可能
     - システム管理者: すべて承認可能
     - 制作者: 承認不可
     ```typescript
     const canApprove = useMemo(() => {
       if (currentUser?.role === 'super_admin') return true;
       if (currentUser?.role === 'creator') return false;
       if (currentUser?.role === 'municipality_user') {
         return business?.municipality_id === currentUser.municipality_id;
       }
       if (currentUser?.role === 'business_user') {
         return product?.business_id === currentUser.business_id;
       }
       return false;
     }, [currentUser, business, product]);
     ```

#### 2.5 画像一覧ページ
- **ファイル**: `pages/ImageList.tsx`
- **変更内容**: 
  1. 一括承認機能（131-140行目）に権限チェックを追加
     ```typescript
     const handleBulkApprove = () => {
       const idsToApprove = Array.from(selectedIds);
       idsToApprove.forEach(id => {
         const img = filteredImages.find(i => i.id === id);
         if (img && img.latestVersion.status === 'pending_review') {
           // 権限チェック
           if (canApproveImage(currentUser, img)) {
             mockDb.updateVersionStatus(img.id, img.latestVersion.id, 'approved');
           }
         }
       });
       setSelectedIds(new Set());
     };
     ```
  2. フィルタリングロジック（83-107行目）を確認し、各役割に適切な画像のみ表示
     - 制作者: 自分が作成した画像のみ表示（`created_by_admin_id` でフィルタ）

#### 2.6 画像アップロードページ
- **ファイル**: `pages/ImageUpload.tsx`
- **変更内容**: 
  - アップロード権限チェック: システム管理者と制作者のみアップロード可能
  ```typescript
  if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'creator') {
    navigate('/');
    return null;
  }
  ```

#### 2.7 ダッシュボード
- **ファイル**: `pages/Dashboard.tsx`
- **変更内容**: 
  - フィルタリングロジック（24-33行目）を確認し、各役割に適切な画像のみ表示
  ```typescript
  const relevantImages = images.filter(img => {
    const product = mockDb.getProductById(img.product_id);
    if (currentUser?.role === 'municipality_user') {
      const business = product ? mockDb.getBusinessById(product.business_id) : null;
      return business?.municipality_id === currentUser.municipality_id;
    }
    if (currentUser?.role === 'business_user') {
      return product?.business_id === currentUser.business_id;
    }
    if (currentUser?.role === 'creator') {
      return img.created_by_admin_id === currentUser.id;
    }
    return true; // super_admin
  });
  ```

#### 2.8 ログインページ
- **ファイル**: `pages/Login.tsx`
- **変更内容**: 
  - 制作者のログインフローを追加（必要に応じて）
  - 現在は `'municipality' | 'business'` の選択があるが、制作者の選択肢を追加するか、直接ログインするかを検討

### 3. 権限チェックの実装

#### 3.1 承認権限のヘルパー関数
新しいヘルパーファイルを作成: `utils/permissions.ts`

```typescript
import { User, ImageEntity, Product, Business } from '../types';

/**
 * 画像を承認できるかチェック
 */
export const canApproveImage = (
  user: User | null,
  image: ImageEntity,
  product?: Product,
  business?: Business
): boolean => {
  if (!user) return false;
  
  // システム管理者はすべて承認可能
  if (user.role === 'super_admin') return true;
  
  // 制作者は承認不可
  if (user.role === 'creator') return false;
  
  // 自治体ユーザー: 自分の自治体の商品のみ承認可能
  if (user.role === 'municipality_user') {
    if (!business || !user.municipality_id) return false;
    return business.municipality_id === user.municipality_id;
  }
  
  // 事業者ユーザー: 自分の商品のみ承認可能
  if (user.role === 'business_user') {
    if (!product || !user.business_id) return false;
    return product.business_id === user.business_id;
  }
  
  return false;
};

/**
 * 画像をアップロードできるかチェック
 */
export const canUploadImage = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'super_admin' || user.role === 'creator';
};

/**
 * チャットを表示できるかチェック
 */
export const canViewChat = (user: User | null): boolean => {
  if (!user) return false;
  return user.role !== 'business_user';
};

/**
 * チャットを送信できるかチェック
 */
export const canSendChat = (user: User | null): boolean => {
  if (!user) return false;
  return user.role !== 'business_user';
};
```

#### 3.2 商品と事業者の関連付け
- 商品テーブルの `business_id` を使用して、事業者ユーザーが自分の商品の画像のみ承認可能にする
- 既存の `Product` インターフェースには `business_id` が含まれているため、追加の変更は不要

## 実装の優先順位

1. **バックエンド**: マイグレーション、モデル、シーダーの更新
2. **フロントエンド**: 認証コンテキストと型定義の更新
3. **権限チェックヘルパー**: `utils/permissions.ts` の作成
4. **チャット機能の制御**: 事業者ユーザーに対して非表示
5. **承認機能の権限チェック**: 各役割に適切な権限を設定
6. **アップロード機能の権限チェック**: 制作者とシステム管理者のみ
7. **UI調整**: メニュー、ラベル、フィルタリングの更新

## 注意事項

- 既存のユーザーデータとの互換性を保つため、マイグレーションは慎重に実装
- フロントエンドとバックエンドの権限チェックを両方実装（セキュリティのため）
- チャット機能の非表示は、事業者ユーザーがページにアクセスしてもチャットセクションが表示されないようにする
- 制作者は画像をアップロードできるが、承認はできない点に注意
- 事業者ユーザーはチャットを完全に非表示にするため、メッセージ機能へのアクセスができない

## テスト項目

実装後、以下の項目をテストする必要があります：

1. **システム管理者**
   - すべての機能にアクセス可能か
   - すべての画像を承認可能か
   - チャットの送受信が可能か

2. **制作者**
   - 画像のアップロードが可能か
   - 画像の承認ができないか
   - チャットの送受信が可能か
   - 自分が作成した画像のみ表示されるか

3. **自治体ユーザー**
   - 自分の自治体の画像のみ表示されるか
   - 自分の自治体の画像のみ承認可能か
   - チャットの送受信が可能か

4. **事業者ユーザー**
   - 自分の商品の画像のみ表示されるか
   - 自分の商品の画像のみ承認可能か
   - チャットが完全に非表示になっているか

## マイグレーション手順

1. マイグレーションファイルを更新
2. 既存のデータベースをバックアップ
3. マイグレーションを実行: `php artisan migrate`
4. シーダーを実行: `php artisan db:seed`
5. 既存ユーザーのデータ整合性を確認
