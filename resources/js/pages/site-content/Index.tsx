import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Globe,
    Target,
    Eye,
    PhoneCall,
    Award,
    Activity,
    Plus,
    Trash2,
    Save,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '#',
    },
    {
        title: 'Website Content',
        href: '/site-content',
    },
];

interface PointItem {
    text: string;
}

interface StatItem {
    label: string;
    value: string;
}

interface ValueItem {
    title: string;
    description: string;
}

interface SiteContentsData {
    about?: {
        badge: string;
        title: string;
        description: string;
    };
    mission?: {
        title: string;
        description: string;
        points: string[];
    };
    vision?: {
        title: string;
        description: string;
        points: string[];
    };
    contact?: {
        hotline: string;
        email: string;
        address: string;
        operating_hours: string;
        emergency_hours: string;
        emergency_notice: string;
    };
    stats?: StatItem[];
    values?: ValueItem[];
}

interface Props {
    contents: SiteContentsData;
}

export default function SiteContentIndex({ contents }: Props) {
    const [activeTab, setActiveTab] = useState<'mission-vision' | 'about' | 'contact' | 'values' | 'stats'>('mission-vision');

    const { data, setData, put, processing, errors } = useForm({
        about: {
            badge: contents.about?.badge || 'Dedicated Healthcare Partner',
            title: contents.about?.title || 'About HelixPharma',
            description: contents.about?.description || '',
        },
        mission: {
            title: contents.mission?.title || 'Our Mission',
            description: contents.mission?.description || '',
            points: contents.mission?.points || [
                '100% verified authentic medicines direct from licensed distributors',
                'Prescription accuracy and clinical verification for every order',
                'Accessible healthcare support regardless of geography or time',
            ],
        },
        vision: {
            title: contents.vision?.title || 'Our Vision',
            description: contents.vision?.description || '',
            points: contents.vision?.points || [
                'Seamless integration between digital orders and physical dispensing',
                'Advanced cold-chain storage logistics for specialized therapeutics',
                'Empowering patients with medication literacy and preventative health care',
            ],
        },
        contact: {
            hotline: contents.contact?.hotline || '+95 9 123 456 789',
            email: contents.contact?.email || 'support@helixpharma.com',
            address: contents.contact?.address || 'No. 124, Pyay Road, Kamayut Township, Yangon, Myanmar',
            operating_hours: contents.contact?.operating_hours || 'Monday – Sunday: 8:00 AM – 10:00 PM',
            emergency_hours: contents.contact?.emergency_hours || '24/7 Emergency Medicine Dispatch Available',
            emergency_notice: contents.contact?.emergency_notice || '',
        },
        stats: contents.stats || [
            { label: 'Prescriptions Dispensed', value: '50K+' },
            { label: 'Verified Patients', value: '15,000+' },
            { label: 'FDA Approved Items', value: '100%' },
            { label: 'Emergency Counter', value: '24/7' },
        ],
        values: contents.values || [
            { title: 'Uncompromising Authenticity', description: 'Zero tolerance for counterfeit medications. Batch tracing and sealed manufacturer packaging.' },
            { title: 'Licensed Pharmacists', description: 'Every dispensed item is verified by certified pharmacists for correct strength, dosage, and compatibility.' },
            { title: 'Cold-Chain Storage', description: 'Temperature-regulated storage and packaging to protect sensitive biologics, vaccines, and insulins.' },
            { title: 'Patient-Centric Care', description: 'Warm, attentive care. Clear dosage instructions in Burmese and English with refill reminders.' },
        ],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/site-content', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Website content updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update content. Please check input limits.');
            },
        });
    };

    // Helper to add a bullet point (max 4)
    const addMissionPoint = () => {
        if (data.mission.points.length >= 4) {
            toast.warning('Maximum 4 points allowed to prevent UI overflow.');
            return;
        }
        setData('mission', {
            ...data.mission,
            points: [...data.mission.points, ''],
        });
    };

    const removeMissionPoint = (index: number) => {
        if (data.mission.points.length <= 1) {
            toast.warning('At least 1 point is required.');
            return;
        }
        setData('mission', {
            ...data.mission,
            points: data.mission.points.filter((_, i) => i !== index),
        });
    };

    const addVisionPoint = () => {
        if (data.vision.points.length >= 4) {
            toast.warning('Maximum 4 points allowed to prevent UI overflow.');
            return;
        }
        setData('vision', {
            ...data.vision,
            points: [...data.vision.points, ''],
        });
    };

    const removeVisionPoint = (index: number) => {
        if (data.vision.points.length <= 1) {
            toast.warning('At least 1 point is required.');
            return;
        }
        setData('vision', {
            ...data.vision,
            points: data.vision.points.filter((_, i) => i !== index),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Content Management" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                <Globe className="w-4 h-4" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900">Website Content Management</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Configure customer web portal content with strict row limits to prevent design breakages.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-2 text-xs"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving...' : 'Save All Changes'}</span>
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
                    {[
                        { id: 'mission-vision', label: 'Mission & Vision', icon: Target },
                        { id: 'contact', label: 'Contact Session', icon: PhoneCall },
                        { id: 'about', label: 'About Us Overview', icon: Globe },
                        { id: 'values', label: 'Core Healthcare Values', icon: Award },
                        { id: 'stats', label: 'Milestone Stats', icon: Activity },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                                    active
                                        ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Form Panels */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* TAB 1: Mission & Vision */}
                    {activeTab === 'mission-vision' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Mission Card */}
                            <Card className="border-teal-200 shadow-xs">
                                <CardHeader className="bg-teal-50/40 pb-4 border-b border-teal-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-teal-600" />
                                            <span>Our Mission</span>
                                        </CardTitle>
                                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                                            Max 4 Bullet Points
                                        </span>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Defines the core purpose shown on the customer storefront.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Mission Title</Label>
                                        <Input
                                            value={data.mission.title}
                                            onChange={(e) => setData('mission', { ...data.mission, title: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Mission Description</Label>
                                        <Textarea
                                            rows={3}
                                            value={data.mission.description}
                                            onChange={(e) => setData('mission', { ...data.mission, description: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={500}
                                        />
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-slate-700">
                                                Key Commitments ({data.mission.points.length}/4)
                                            </Label>
                                            {data.mission.points.length < 4 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addMissionPoint}
                                                    className="h-7 text-[11px] gap-1 text-teal-700 border-teal-300 hover:bg-teal-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>Add Point</span>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {data.mission.points.map((pt, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold text-slate-400 w-5">
                                                        {idx + 1}.
                                                    </span>
                                                    <Input
                                                        value={pt}
                                                        onChange={(e) => {
                                                            const updated = [...data.mission.points];
                                                            updated[idx] = e.target.value;
                                                            setData('mission', { ...data.mission, points: updated });
                                                        }}
                                                        placeholder="Enter commitment point..."
                                                        className="text-xs"
                                                        maxLength={160}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeMissionPoint(idx)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vision Card */}
                            <Card className="border-cyan-200 shadow-xs">
                                <CardHeader className="bg-cyan-50/40 pb-4 border-b border-cyan-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-cyan-600" />
                                            <span>Our Vision</span>
                                        </CardTitle>
                                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                                            Max 4 Bullet Points
                                        </span>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Future roadmap & goals for customer healthcare services.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Vision Title</Label>
                                        <Input
                                            value={data.vision.title}
                                            onChange={(e) => setData('vision', { ...data.vision, title: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Vision Description</Label>
                                        <Textarea
                                            rows={3}
                                            value={data.vision.description}
                                            onChange={(e) => setData('vision', { ...data.vision, description: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={500}
                                        />
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-slate-700">
                                                Vision Pillars ({data.vision.points.length}/4)
                                            </Label>
                                            {data.vision.points.length < 4 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addVisionPoint}
                                                    className="h-7 text-[11px] gap-1 text-cyan-700 border-cyan-300 hover:bg-cyan-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>Add Point</span>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {data.vision.points.map((pt, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold text-slate-400 w-5">
                                                        {idx + 1}.
                                                    </span>
                                                    <Input
                                                        value={pt}
                                                        onChange={(e) => {
                                                            const updated = [...data.vision.points];
                                                            updated[idx] = e.target.value;
                                                            setData('vision', { ...data.vision, points: updated });
                                                        }}
                                                        placeholder="Enter vision pillar..."
                                                        className="text-xs"
                                                        maxLength={160}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeVisionPoint(idx)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* TAB 2: Contact Session */}
                    {activeTab === 'contact' && (
                        <Card className="shadow-xs">
                            <CardHeader className="bg-slate-50/60 pb-4 border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <PhoneCall className="w-4 h-4 text-teal-600" />
                                    <span>Contact Session Data</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Display hotline, clinical branch address, and operating hours across the customer app.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Hotline Phone Number *</Label>
                                        <Input
                                            value={data.contact.hotline}
                                            onChange={(e) => setData('contact', { ...data.contact, hotline: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={60}
                                            placeholder="+95 9 123 456 789"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Support Email Address *</Label>
                                        <Input
                                            type="email"
                                            value={data.contact.email}
                                            onChange={(e) => setData('contact', { ...data.contact, email: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={100}
                                            placeholder="support@helixpharma.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-slate-700">Flagship Pharmacy Address *</Label>
                                    <Input
                                        value={data.contact.address}
                                        onChange={(e) => setData('contact', { ...data.contact, address: e.target.value })}
                                        className="mt-1 text-xs"
                                        maxLength={255}
                                        placeholder="Street, Township, City..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Operating Hours *</Label>
                                        <Input
                                            value={data.contact.operating_hours}
                                            onChange={(e) => setData('contact', { ...data.contact, operating_hours: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={120}
                                            placeholder="Monday – Sunday: 8:00 AM – 10:00 PM"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold text-slate-700">Emergency Hours / Badge *</Label>
                                        <Input
                                            value={data.contact.emergency_hours}
                                            onChange={(e) => setData('contact', { ...data.contact, emergency_hours: e.target.value })}
                                            className="mt-1 text-xs"
                                            maxLength={120}
                                            placeholder="24/7 Emergency Medicine Dispatch Available"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-slate-700">Emergency Medical Notice *</Label>
                                    <Textarea
                                        rows={3}
                                        value={data.contact.emergency_notice}
                                        onChange={(e) => setData('contact', { ...data.contact, emergency_notice: e.target.value })}
                                        className="mt-1 text-xs"
                                        maxLength={500}
                                        placeholder="If you are experiencing a life-threatening medical emergency..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 3: About Us Overview */}
                    {activeTab === 'about' && (
                        <Card className="shadow-xs">
                            <CardHeader className="bg-slate-50/60 pb-4 border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-teal-600" />
                                    <span>About Us Overview</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Brand introduction shown at the top of the About Us section.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <Label className="text-xs font-semibold text-slate-700">Header Pill Badge</Label>
                                    <Input
                                        value={data.about.badge}
                                        onChange={(e) => setData('about', { ...data.about, badge: e.target.value })}
                                        className="mt-1 text-xs"
                                        maxLength={60}
                                        placeholder="Dedicated Healthcare Partner"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-slate-700">Main Heading Title</Label>
                                    <Input
                                        value={data.about.title}
                                        onChange={(e) => setData('about', { ...data.about, title: e.target.value })}
                                        className="mt-1 text-xs"
                                        maxLength={100}
                                        placeholder="About HelixPharma"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-slate-700">Introductory Paragraph</Label>
                                    <Textarea
                                        rows={4}
                                        value={data.about.description}
                                        onChange={(e) => setData('about', { ...data.about, description: e.target.value })}
                                        className="mt-1 text-xs"
                                        maxLength={500}
                                        placeholder="Founded with a commitment to patient wellness..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 4: Core Values (Max 4 Cards) */}
                    {activeTab === 'values' && (
                        <Card className="shadow-xs">
                            <CardHeader className="bg-slate-50/60 pb-4 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-teal-600" />
                                        <span>Core Healthcare Values</span>
                                    </CardTitle>
                                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                        Fixed 4-Card Grid Limitation
                                    </span>
                                </div>
                                <CardDescription className="text-xs">
                                    Limited to 4 values to perfectly match the 4-column responsive grid without awkward wrapping.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.values.map((val, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-teal-700">Pillar #{idx + 1}</span>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-600">Title</Label>
                                                <Input
                                                    value={val.title}
                                                    onChange={(e) => {
                                                        const updated = [...data.values];
                                                        updated[idx] = { ...updated[idx], title: e.target.value };
                                                        setData('values', updated);
                                                    }}
                                                    className="mt-1 text-xs bg-white"
                                                    maxLength={60}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-600">Description</Label>
                                                <Textarea
                                                    rows={2}
                                                    value={val.description}
                                                    onChange={(e) => {
                                                        const updated = [...data.values];
                                                        updated[idx] = { ...updated[idx], description: e.target.value };
                                                        setData('values', updated);
                                                    }}
                                                    className="mt-1 text-xs bg-white"
                                                    maxLength={250}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 5: Milestone Stats (Max 4 Counters) */}
                    {activeTab === 'stats' && (
                        <Card className="shadow-xs">
                            <CardHeader className="bg-slate-50/60 pb-4 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-teal-600" />
                                        <span>Milestone Statistics</span>
                                    </CardTitle>
                                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                        Fixed 4-Stat Grid Limitation
                                    </span>
                                </div>
                                <CardDescription className="text-xs">
                                    Limited to 4 key numbers to fit the dark metric banner.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {data.stats.map((st, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                            <span className="text-xs font-bold text-teal-700">Stat #{idx + 1}</span>
                                            <div>
                                                <Label className="text-xs text-slate-600">Metric Value</Label>
                                                <Input
                                                    value={st.value}
                                                    onChange={(e) => {
                                                        const updated = [...data.stats];
                                                        updated[idx] = { ...updated[idx], value: e.target.value };
                                                        setData('stats', updated);
                                                    }}
                                                    className="mt-1 text-xs bg-white font-mono font-bold"
                                                    maxLength={30}
                                                    placeholder="50K+"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-600">Label / Caption</Label>
                                                <Input
                                                    value={st.label}
                                                    onChange={(e) => {
                                                        const updated = [...data.stats];
                                                        updated[idx] = { ...updated[idx], label: e.target.value };
                                                        setData('stats', updated);
                                                    }}
                                                    className="mt-1 text-xs bg-white"
                                                    maxLength={60}
                                                    placeholder="Prescriptions Dispensed"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Bottom Save Action */}
                    <div className="pt-4 flex items-center justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-2 text-xs"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving Changes...' : 'Save All Changes'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

