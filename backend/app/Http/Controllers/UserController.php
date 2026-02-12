<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * ユーザー一覧を取得
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // タイプでフィルタリング
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // ページネーション
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * ユーザー詳細を取得
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->type,
                'municipality_id' => $user->municipality_id,
                'business_id' => $user->business_id,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * ユーザーを作成
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'type' => ['required', Rule::in(['admin', 'municipality', 'business'])],
            'municipality_id' => 'nullable|integer|exists:municipalities,id',
            'business_id' => 'nullable|integer|exists:businesses,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => $validated['type'],
            'municipality_id' => $validated['municipality_id'] ?? null,
            'business_id' => $validated['business_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'ユーザーが作成されました。',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->type,
                'municipality_id' => $user->municipality_id,
                'business_id' => $user->business_id,
            ],
        ], 201);
    }

    /**
     * ユーザーを更新
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'type' => ['sometimes', Rule::in(['admin', 'municipality', 'business'])],
            'municipality_id' => 'nullable|integer|exists:municipalities,id',
            'business_id' => 'nullable|integer|exists:businesses,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'ユーザーが更新されました。',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->type,
                'municipality_id' => $user->municipality_id,
                'business_id' => $user->business_id,
            ],
        ]);
    }

    /**
     * ユーザーを削除
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'ユーザーが削除されました。']);
    }
}
