<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
{
    $query = User::query();

    // Filter by search (name or email)
    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // Filter by role
    if ($request->filled('role')) {
        $query->where('role', $request->input('role'));
    }

    $users = $query->paginate(10)->withQueryString();

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
    $user = User::findOrFail($id);

    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        'role' => 'required|string|in:user,admin,cahier',
        'password' => 'nullable|string|min:6', // optional password
    ]);

    $user->name = $request->name;
    $user->email = $request->email;
    $user->role = $request->role; 
    if ($request->filled('password')) { 
        $user->password = Hash::make($request->password);
    }

    $user->save();
    // for logout
    if ($request->filled('password') && $user->role === 'admin') {
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
    $user = User::findOrFail($id);
    $user->delete();

    return redirect()->back()->with('success', 'User deleted successfully.');
}
}
