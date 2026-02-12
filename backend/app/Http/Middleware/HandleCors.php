<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\HandleCors as Middleware;

class HandleCors extends Middleware
{
    /**
     * The paths that should be accessible while the application is in maintenance mode.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];
}
