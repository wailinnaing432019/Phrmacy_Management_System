import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Flame,
    LoaderCircle,
    Pencil,
    Plus,
    Sparkles,
    Tag,
    Trash2,
} from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/categories' },
];

type CategoryForm = {
    name: string;
    description: string;
    trending: boolean;
};

type Category = {
    id: number;
    name: string;
    description: string;
    trending: boolean | number;
};

export default function Index({ categories = [] }: { categories: Category[] }) {
    const [editingCategory, setEditingCategory] = useState<(CategoryForm & { id: number }) | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: updating,
        errors: editErrors,
        reset: resetEditForm,
    } = useForm<CategoryForm>({
        name: '',
        description: '',
        trending: false,
    });

    const openEditDialog = (category: Category) => {
        setEditingCategory({
            id: category.id,
            name: category.name,
            description: category.description || '',
            trending: !!category.trending,
        });
        setEditData({
            name: category.name,
            description: category.description || '',
            trending: !!category.trending,
        });
    };

    const updateCategory: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingCategory) return;
        put(route('categories.update', editingCategory.id), {
            onSuccess: () => {
                resetEditForm();
                setEditingCategory(null);
            },
        });
    };

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        errors: createErrors,
        reset: resetCreateForm,
    } = useForm<CategoryForm>({
        name: '',
        description: '',
        trending: false,
    });

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                resetCreateForm();
                setCreateDialogOpen(false);
            },
        });
    };

    const destroyHandle = (id: number) => {
        router.delete(route('categories.destroy', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medicine Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Medicine Categories
                            </h1>
                            <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                                {categories.length} Total
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Organize pharmaceutical classifications, product lines, and trending collections.
                        </p>
                    </div>

                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 gap-2 rounded-xl bg-teal-600 px-4 font-semibold text-white shadow-sm shadow-teal-600/30 hover:bg-teal-700 transition-all">
                                <Plus className="size-4" />
                                <span>Add Category</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl sm:max-w-md">
                            <form onSubmit={submitCreate}>
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-bold">Add New Category</DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Create a classification group for your pharmaceutical inventory.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-name" className="text-xs font-semibold">
                                            Category Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="create-name"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            placeholder="e.g. Antibiotics, Pain Relief, Vitamins"
                                            className="rounded-xl"
                                            required
                                        />
                                        <InputError message={createErrors.name} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="create-desc" className="text-xs font-semibold">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="create-desc"
                                            rows={3}
                                            value={createData.description}
                                            onChange={(e) => setCreateData('description', e.target.value)}
                                            placeholder="Brief notes on pharmaceuticals in this group..."
                                            className="rounded-xl resize-none"
                                        />
                                        <InputError message={createErrors.description} />
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="create-trending" className="text-xs font-semibold cursor-pointer">
                                                Featured / Trending Category
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Highlight on storefront home and quick filters.
                                            </p>
                                        </div>
                                        <Switch
                                            id="create-trending"
                                            checked={createData.trending}
                                            onCheckedChange={(checked) => setCreateData('trending', checked)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" className="rounded-xl text-xs">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={creating}
                                        className="rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700"
                                    >
                                        {creating ? (
                                            <>
                                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Category'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table Card */}
                <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-14 text-center">#</TableHead>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Trending Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/60">
                                {categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                                        <Tag className="size-4" />
                                                    </div>
                                                    <span className="font-bold text-sm text-foreground">
                                                        {category.name}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                                                    {category.description || '—'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                {category.trending ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
                                                        <Sparkles className="size-3 text-amber-500" />
                                                        Trending
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                                        Standard
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={() => openEditDialog(category)}
                                                                    className="size-8 rounded-lg text-foreground hover:bg-accent"
                                                                >
                                                                    <Pencil className="size-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit Category</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
                                                                        >
                                                                            <Trash2 className="size-3.5" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent className="rounded-2xl">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle className="text-destructive">
                                                                                Delete Category?
                                                                            </AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete{' '}
                                                                                <strong className="text-foreground">{category.name}</strong>?
                                                                                Medicines assigned to this category may need re-assignment.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel className="rounded-xl">
                                                                                Cancel
                                                                            </AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => destroyHandle(category.id)}
                                                                                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            >
                                                                                Confirm Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete Category</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Tag className="size-8 text-muted-foreground/40 mb-2" />
                                                <span className="font-semibold text-sm text-foreground">
                                                    No categories created yet
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Click 'Add Category' to create your first pharmaceutical classification.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Edit Category Dialog */}
                {editingCategory && (
                    <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                        <DialogContent className="rounded-2xl sm:max-w-md">
                            <form onSubmit={updateCategory}>
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-bold">Edit Category</DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Update classification details and visibility.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-name" className="text-xs font-semibold">
                                            Category Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="edit-name"
                                            value={editData.name}
                                            onChange={(e) => setEditData('name', e.target.value)}
                                            className="rounded-xl"
                                            required
                                        />
                                        <InputError message={editErrors.name} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-desc" className="text-xs font-semibold">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="edit-desc"
                                            rows={3}
                                            value={editData.description}
                                            onChange={(e) => setEditData('description', e.target.value)}
                                            className="rounded-xl resize-none"
                                        />
                                        <InputError message={editErrors.description} />
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="edit-trending" className="text-xs font-semibold cursor-pointer">
                                                Trending Category
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Feature on customer home and quick filters.
                                            </p>
                                        </div>
                                        <Switch
                                            id="edit-trending"
                                            checked={editData.trending}
                                            onCheckedChange={(checked) => setEditData('trending', checked)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingCategory(null)}
                                        className="rounded-xl text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={updating}
                                        className="rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700"
                                    >
                                        {updating ? (
                                            <>
                                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Category'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
