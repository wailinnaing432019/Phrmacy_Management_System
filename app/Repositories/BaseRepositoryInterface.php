<?php

namespace App\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    /**
     * Start a fresh query for the repository model.
     */
    public function query(): Builder;

    /**
     * Get every record for the repository model.
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Paginate the repository model.
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Find a record by its primary key.
     */
    public function find(int|string $id, array $columns = ['*']): ?Model;

    /**
     * Find a record or throw a model-not-found exception.
     */
    public function findOrFail(int|string $id, array $columns = ['*']): Model;

    /**
     * Create a new record.
     */
    public function create(array $attributes): Model;

    /**
     * Update an existing record.
     */
    public function update(Model $model, array $attributes): Model;

    /**
     * Delete a record, soft-deleting it when the model supports it.
     */
    public function delete(Model $model): bool;

    /**
     * Restore a soft-deleted record.
     */
    public function restore(Model $model): bool;

    /**
     * Permanently delete a record.
     */
    public function forceDelete(Model $model): bool;

    /**
     * Count the records for the repository model.
     */
    public function count(): int;
}
