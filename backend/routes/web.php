<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'ふるさと納税制作管理システム API',
        'version' => '1.0.0',
    ]);
});
