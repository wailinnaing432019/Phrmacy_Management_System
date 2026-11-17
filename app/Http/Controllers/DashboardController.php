<?php

namespace App\Http\Controllers;

use App\Services\Dashboard\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboard,
    ) {}

    public function index()
    {
        return Inertia::render('dashboard', $this->dashboard->metrics());
    }
}
