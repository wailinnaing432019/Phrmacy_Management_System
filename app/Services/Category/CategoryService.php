<?php

namespace App\Services\Category;

use App\Models\Category;
use App\Repositories\Category\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class CategoryService
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categories,
    ) {}

    public function list(): Collection
    {
        return $this->categories->all();
    }

    /**
     * Category names used by the medicine list filter.
     */
    public function names(): \Illuminate\Support\Collection
    {
        return $this->categories->query()->pluck('name');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Model
    {
        return $this->categories->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Category $category, array $data): Model
    {
        return $this->categories->update($category, $data);
    }

    public function delete(Category $category): bool
    {
        return $this->categories->delete($category);
    }
}
