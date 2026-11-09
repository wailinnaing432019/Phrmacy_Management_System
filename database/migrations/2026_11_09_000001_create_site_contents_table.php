<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->timestamps();
        });

        // Seed initial default content
        $defaults = [
            'about' => [
                'badge' => 'Dedicated Healthcare Partner',
                'title' => 'About HelixPharma',
                'description' => 'Founded with a commitment to patient wellness and pharmaceutical integrity, HelixPharma combines modern retail pharmacy excellence with swift, reliable doorstep delivery across Myanmar.',
            ],
            'mission' => [
                'title' => 'Our Mission',
                'description' => 'To deliver safe, genuine, and affordable pharmaceutical care directly to every home, backed by professional clinical guidance, transparent pricing, and rigorous quality standards.',
                'points' => [
                    '100% verified authentic medicines direct from licensed distributors',
                    'Prescription accuracy and clinical verification for every order',
                    'Accessible healthcare support regardless of geography or time',
                ],
            ],
            'vision' => [
                'title' => 'Our Vision',
                'description' => 'To be Myanmar\'s most trusted digital and community healthcare ecosystem, leading the transition to transparent, intelligent, and patient-centered pharmacy services.',
                'points' => [
                    'Seamless integration between digital orders and physical dispensing',
                    'Advanced cold-chain storage logistics for specialized therapeutics',
                    'Empowering patients with medication literacy and preventative health care',
                ],
            ],
            'contact' => [
                'hotline' => '+95 9 123 456 789',
                'email' => 'support@helixpharma.com',
                'address' => 'No. 124, Pyay Road, Kamayut Township, Yangon, Myanmar',
                'operating_hours' => 'Monday – Sunday: 8:00 AM – 10:00 PM',
                'emergency_hours' => '24/7 Emergency Medicine Dispatch Available',
                'emergency_notice' => 'If you are experiencing a life-threatening medical emergency, please contact 192 (Ambulance) or visit your nearest hospital emergency department immediately.',
            ],
            'stats' => [
                ['label' => 'Prescriptions Dispensed', 'value' => '50K+'],
                ['label' => 'Verified Patients', 'value' => '15,000+'],
                ['label' => 'FDA Approved Items', 'value' => '100%'],
                ['label' => 'Emergency Counter', 'value' => '24/7'],
            ],
            'values' => [
                ['title' => 'Uncompromising Authenticity', 'description' => 'Zero tolerance for counterfeit medications. Batch tracing and sealed manufacturer packaging.'],
                ['title' => 'Licensed Pharmacists', 'description' => 'Every dispensed item is verified by certified pharmacists for correct strength, dosage, and compatibility.'],
                ['title' => 'Cold-Chain Storage', 'description' => 'Temperature-regulated storage and packaging to protect sensitive biologics, vaccines, and insulins.'],
                ['title' => 'Patient-Centric Care', 'description' => 'Warm, attentive care. Clear dosage instructions in Burmese and English with refill reminders.'],
            ],
        ];

        $now = now();
        foreach ($defaults as $key => $value) {
            DB::table('site_contents')->insert([
                'key' => $key,
                'value' => json_encode($value),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
