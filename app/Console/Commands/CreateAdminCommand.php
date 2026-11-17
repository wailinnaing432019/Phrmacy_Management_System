<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin
                            {--name= : Administrator name}
                            {--email= : Administrator email address}
                            {--password= : Password (omit to be prompted)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a verified administrator account';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->option('name') ?: $this->ask('Name', 'Administrator');
        $email = $this->option('email') ?: $this->ask('Email address');
        $password = $this->option('password') ?: $this->secret('Password (min 8 characters)');

        $validator = Validator::make(
            compact('name', 'email', 'password'),
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => User::ROLE_ADMIN,
        ]);

        // email_verified_at is intentionally not mass-assignable; verify the
        // account explicitly so the new admin can sign in immediately.
        $user->markEmailAsVerified();

        $this->info("Administrator {$email} created. You can now sign in.");

        return self::SUCCESS;
    }
}
