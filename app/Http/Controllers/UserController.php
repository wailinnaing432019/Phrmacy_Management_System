<?php

namespace App\Http\Controllers;

use App\Http\Resources\User\UserListResource;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $users,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = $this->users->paginate($request->only(['search', 'role']))
            ->through(fn (User $user) => (new UserListResource($user))->resolve());

        return inertia('user/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Logic to show user creation form
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Logic to store a new user
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Logic to show a specific user
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        // Logic to show user edit form
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = $this->users->find((int) $id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'role' => ['required', 'string', Rule::in(['admin', 'cashier', 'user'])],
            'password' => 'nullable|string|min:6',
        ]);

        $user = $this->users->update($user, $validated);

        // If the admin edited their own account and changed the password or lost
        // the admin role, end the session so the change takes effect immediately.
        $editedSelf = $request->user()->id === $user->id;

        if ($editedSelf && ($request->filled('password') || $user->role !== 'admin')) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/');
        }

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = $this->users->find((int) $id);
        $this->users->delete($user);

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
