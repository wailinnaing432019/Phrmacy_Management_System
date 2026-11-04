<?php

namespace App\Services\Supplier;

use App\Models\Supplier;
use App\Repositories\Supplier\SupplierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class SupplierService
{
    public function __construct(
        private readonly SupplierRepositoryInterface $suppliers,
    ) {}

    public function list(): Collection
    {
        return $this->suppliers->all();
    }

    /**
     * Lightweight supplier options for select inputs.
     */
    public function options(): Collection
    {
        return $this->suppliers->all(['id', 'name']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Model
    {
        return $this->suppliers->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Supplier $supplier, array $data): Model
    {
        return $this->suppliers->update($supplier, $data);
    }

    public function delete(Supplier $supplier): bool
    {
        return $this->suppliers->delete($supplier);
    }
}
