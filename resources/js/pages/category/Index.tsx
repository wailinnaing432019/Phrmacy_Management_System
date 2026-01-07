import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

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
} from "@/components/ui/alert-dialog"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useState } from 'react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Category',
        href: '/categories',
    },
];

type CategoryForm = {
    name: string;
    description: string;
    trending: boolean; // ✅ added trending
};

export default function Index({ categories }) {
    const [editingCategory, setEditingCategory] = useState<CategoryForm & { id: number } | null>(null);
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: updating,
        errors: editErrors,
        reset: resetEditForm
    } = useForm<CategoryForm>({
        name: '',
        description: '',
        trending: false,
    });

    const openEditDialog = (category) => {
        setEditingCategory(category);
        setEditData({
            name: category.name,
            description: category.description,
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

    const closeRef = useRef<HTMLButtonElement>(null);
    const { data, setData, post, processing, errors, reset } = useForm<Required<CategoryForm>>({
        name: '',
        description: '',
        trending: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                reset();
                closeRef.current?.click();
            }
        });
    };

    const destoryHandle = (id: number, name: string) => {
        router.delete(route('categories.destroy', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category" />
            <div className='text-right'>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="m-2 p-2   hover:font-extrabold">Add Category</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={submit}>
                            <DialogHeader>
                                <DialogTitle>Add Category</DialogTitle>
                                <DialogDescription>
                                    Create your Category for your medicines
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        tabIndex={2}
                                        autoComplete="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder='Small Talk to your category'
                                    />
                                </div>
                                <div className="">
                                    <Label htmlFor="trending">Trending</Label>
                                    <input
                                        className='ml-4 mt-3'
                                        type="checkbox"
                                        id="trending"
                                        checked={data.trending}
                                        onChange={(e) => setData('trending', e.target.checked)}
                                    />
                                </div>
                            </div>
                            <DialogFooter className='m-3'>
                                <DialogClose asChild>
                                    <Button ref={closeRef} className=" p-2 rounded" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" className="p-1   rounded" tabIndex={4} disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Create Category
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 shadow-2xl m-3">
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption>A list of your categories.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Trending</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length > 0 ? (
                                categories.map((category, index) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>

                                        <TableCell className="max-w-[150px] truncate">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>{category.name}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        {category.name}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>

                                        <TableCell className="max-w-[250px] truncate">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>{category.description}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        {category.description}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>

                                        <TableCell>
                                            {category.trending ? '✅ Yes' : '❌ No'}
                                        </TableCell>

                                        <TableCell className="text-right space-x-1">
                                            <Button
                                                className="mt-4  "
                                                onClick={() => openEditDialog(category)}
                                            >
                                                Edit
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" className="mt-4 bg-red-800 hover:bg-red-400">
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader className="text-red-700">
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your
                                                            category <span className="text-xl text-red-400 italic">{category.name}</span> from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="text-red-700 hover:bg-gray-900"
                                                            onClick={() => destoryHandle(category.id, category.name)}
                                                        >
                                                            Continue
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit dialog */}
            <div>
                {editingCategory && (
                    <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={updateCategory}>
                                <DialogHeader>
                                    <DialogTitle>Edit Category</DialogTitle>
                                    <DialogDescription>
                                        Update your category details
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editData.name}
                                            onChange={(e) => setEditData('name', e.target.value)}
                                        />
                                        <InputError message={editErrors.name} className="mt-2" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={editData.description}
                                            onChange={(e) => setEditData('description', e.target.value)}
                                        />
                                        <InputError message={editErrors.description} className="mt-2" />
                                    </div>
                                    <div className="">
                                        <Label htmlFor="trending">Trending</Label>
                                        <input
                                            className='p-3 m-5'
                                            type="checkbox"
                                            id="trending"
                                            checked={editData.trending}
                                            onChange={(e) => setEditData('trending', e.target.checked)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                        <Button type="button" className="bg-red-500" onClick={() => setEditingCategory(null)}>Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" className="bg-green-600" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Category'}
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
