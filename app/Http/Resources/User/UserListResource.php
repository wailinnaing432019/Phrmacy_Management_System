<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Row shape for the staff user list.
 *
 * @mixin \App\Models\User
 */
class UserListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_super_admin' => (bool) $this->isSuperAdmin(),
            'created_at' => $this->created_at?->format('M d, Y') ?? '-',
        ];
    }
}
