<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 管理者ユーザーを作成
        User::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'type' => 'admin',
        ]);

        // 制作者ユーザーを作成
        User::create([
            'name' => '制作者',
            'email' => 'creator@example.com',
            'password' => Hash::make('password'),
            'type' => 'admin',
        ]);

        // 自治体ユーザーのサンプル
        User::create([
            'name' => '自治体ユーザー',
            'email' => 'municipality@example.com',
            'password' => Hash::make('password'),
            'type' => 'municipality',
            'municipality_id' => 1,
        ]);

        // 事業者ユーザーのサンプル
        User::create([
            'name' => '事業者ユーザー',
            'email' => 'business@example.com',
            'password' => Hash::make('password'),
            'type' => 'business',
            'business_id' => 1,
        ]);
    }
}
