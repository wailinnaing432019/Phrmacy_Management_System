<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentController extends Controller
{
    /**
     * Display the website content configuration page.
     */
    public function index(): Response
    {
        $contents = SiteContent::getFormattedContents();

        return Inertia::render('site-content/Index', [
            'contents' => $contents,
        ]);
    }

    /**
     * Update website contents with strict row and length limitations.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'about.badge' => ['required', 'string', 'max:60'],
            'about.title' => ['required', 'string', 'max:100'],
            'about.description' => ['required', 'string', 'max:500'],

            'mission.title' => ['required', 'string', 'max:100'],
            'mission.description' => ['required', 'string', 'max:500'],
            'mission.points' => ['required', 'array', 'min:1', 'max:4'],
            'mission.points.*' => ['required', 'string', 'max:160'],

            'vision.title' => ['required', 'string', 'max:100'],
            'vision.description' => ['required', 'string', 'max:500'],
            'vision.points' => ['required', 'array', 'min:1', 'max:4'],
            'vision.points.*' => ['required', 'string', 'max:160'],

            'contact.hotline' => ['required', 'string', 'max:60'],
            'contact.email' => ['required', 'email', 'max:100'],
            'contact.address' => ['required', 'string', 'max:255'],
            'contact.operating_hours' => ['required', 'string', 'max:120'],
            'contact.emergency_hours' => ['required', 'string', 'max:120'],
            'contact.emergency_notice' => ['required', 'string', 'max:500'],

            'stats' => ['required', 'array', 'min:1', 'max:4'],
            'stats.*.label' => ['required', 'string', 'max:60'],
            'stats.*.value' => ['required', 'string', 'max:30'],

            'values' => ['required', 'array', 'min:1', 'max:4'],
            'values.*.title' => ['required', 'string', 'max:60'],
            'values.*.description' => ['required', 'string', 'max:250'],
        ], [
            'mission.points.max' => 'Mission bullet points cannot exceed 4 items to prevent UI overflow.',
            'vision.points.max' => 'Vision bullet points cannot exceed 4 items to prevent UI overflow.',
            'stats.max' => 'You can specify at most 4 milestone statistics to fit the grid layout.',
            'values.max' => 'Core Healthcare Values cannot exceed 4 items to preserve the 4-column layout.',
        ]);

        foreach ($validated as $key => $value) {
            SiteContent::setContent($key, $value);
        }

        return redirect()->back()->with('success', 'Website content updated successfully.');
    }
}
