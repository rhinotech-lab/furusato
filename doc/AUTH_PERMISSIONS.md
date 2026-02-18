# ログイン管理・権限設計

## 概要

本システムは4つのユーザー役割を持ちます：

1. **システム管理者（super_admin）**: すべての機能にアクセス可能
2. **制作者（creator）**: 画像のアップロード・制作を担当
3. **自治体ユーザー（municipality_user）**: 自分の自治体の制作の承認とチャットが可能
4. **事業者ユーザー（business_user）**: 自分の商品画像の承認のみ可能、チャットは非表示

## 権限マトリックス

| 機能 | システム管理者 | 制作者 | 自治体 | 事業者 |
|------|--------------|--------|--------|--------|
| ホーム | ○ | ○ | ○ | ○ |
| 通知履歴 | ○ | ○ | ○ | ○ |
| 自治体一覧 | ○ | ○ | - | - |
| 事業者一覧 | ○ | ○ | ○ | - |
| 商品一覧 | ○ | ○ | ○ | ○ |
| 案件一覧 | ○ | ○ | ○ | ○ |
| 画像アップロード | ○ | ○ | - | - |
| 画像承認（全体） | ○ | - | - | - |
| 画像承認（自治体） | ○ | - | ○ | - |
| 画像承認（商品） | ○ | - | - | ○ |
| チャット送受信 | ○ | ○ | ○ | - |
| チャット表示 | ○ | ○ | ○ | - |
| ユーザー管理 | ○ | - | - | - |
| 組織管理 | ○ | - | - | - |
| 設定 | ○ | ○ | ○ | ○ |

## サイドバーメニュー構成

| メニュー名 | パス | アイコン | 表示対象 |
|---|---|---|---|
| ホーム | `/{role}` | LayoutDashboard | 全ユーザー |
| 通知履歴 | `/{role}/notifications` | Bell | 全ユーザー |
| 自治体一覧 | `/admin/municipalities` | Building2 | 管理者, 制作者 |
| 事業者一覧 | `/{role}/businesses` | Store | 管理者, 制作者, 自治体 |
| 商品一覧 | `/{role}/products` | ShoppingBag | 全ユーザー |
| 案件一覧 | `/{role}/images` | Image | 全ユーザー |
| 設定 | `/{role}/users` | Settings | 全ユーザー |

## バックエンド実装

### データベース

#### usersテーブル
- `type` カラム: `enum('admin', 'municipality', 'business', 'creator')`

#### マッピング（バックエンド → フロントエンド）
| バックエンド type | フロントエンド role |
|---|---|
| admin | super_admin |
| creator | creator |
| municipality | municipality_user |
| business | business_user |

### Userモデル

```php
// backend/app/Models/User.php
public function isAdmin(): bool { return $this->type === 'admin'; }
public function isCreator(): bool { return $this->type === 'creator'; }
public function isMunicipality(): bool { return $this->type === 'municipality'; }
public function isBusiness(): bool { return $this->type === 'business'; }
```

### シーダー

```php
// backend/database/seeders/DatabaseSeeder.php
User::create(['name' => '管理者', 'email' => 'admin@example.com', 'type' => 'admin']);
User::create(['name' => '制作者', 'email' => 'creator@example.com', 'type' => 'admin']);
User::create(['name' => '自治体ユーザー', 'email' => 'municipality@example.com', 'type' => 'municipality']);
User::create(['name' => '事業者ユーザー', 'email' => 'business@example.com', 'type' => 'business']);
```

## フロントエンド実装

### 型定義

```typescript
// types.ts
type Role = 'super_admin' | 'creator' | 'municipality_user' | 'business_user';
```

### 認証コンテキスト

```typescript
// context/AuthContext.tsx
// バックエンドの type をフロントエンドの role にマッピング
role: response.user.type === 'admin' ? 'super_admin' :
      response.user.type === 'municipality' ? 'municipality_user' :
      response.user.type === 'business' ? 'business_user' :
      'creator'
```

### 権限チェックヘルパー

```typescript
// utils/permissions.ts（設計）
export const canApproveImage = (user, image, product?, business?) => { ... };
export const canUploadImage = (user) => { ... };
export const canViewChat = (user) => { ... };
export const canSendChat = (user) => { ... };
```

## ルーティング構成

### 管理者・制作者ルート (`/admin`)
- ホーム, 通知, アラート, 案件, 改修, 画像詳細, 新規画像
- 自治体一覧/新規/編集, 事業者一覧/新規/編集, 商品一覧/新規/編集
- 設定

### 自治体ユーザールート (`/municipality`)
- ホーム, 通知, アラート, 案件, 改修, 画像詳細
- 事業者一覧/新規/編集, 商品一覧/新規/編集
- 設定

### 事業者ユーザールート (`/business`)
- ホーム, 通知, 案件, 改修, 画像詳細
- 商品一覧
- 設定

## テスト項目

### システム管理者
- すべての機能にアクセス可能か
- すべての画像を承認可能か
- チャットの送受信が可能か

### 制作者
- 画像のアップロードが可能か
- 画像の承認ができないか
- チャットの送受信が可能か

### 自治体ユーザー
- 自分の自治体の画像のみ表示されるか
- 自分の自治体の画像のみ承認可能か
- チャットの送受信が可能か

### 事業者ユーザー
- 自分の商品の画像のみ表示されるか
- 自分の商品の画像のみ承認可能か
- チャットが完全に非表示になっているか
