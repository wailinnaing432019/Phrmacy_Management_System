<?php

namespace App\Http\Controllers;

use App\Http\Requests\Storefront\ContactRequest;
use App\Mail\ContactConfirmation;
use App\Mail\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Send contact message and user confirmation email.
     */
    public function send(ContactRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Mail::to(config('mail.contact_address'))->send(new ContactMessage($data));
        Mail::to($data['email'])->send(new ContactConfirmation($data));

        return back()->with('success', 'Message sent successfully!');
    }
}
