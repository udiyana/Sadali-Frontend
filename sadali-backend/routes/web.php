<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Sadali Backend API is running',
        'data' => [
            'hero' => [
                'title' => 'Rejuvenate at the Best Spa in Nusa Dua',
                'description' => 'Experience authentic Balinese massage spa treatments, luxury nail care, and holistic wellness Nusa Dua rituals at Sadali Spa & Salon',
                'videos' => [
                    [
                        'src' => '/videos/spa-hero.mp4',
                        'fallback' => 'https://assets.mixkit.co/videos/41708/41708-720.mp4',
                        'title' => 'Candles & Flowers Ritual'
                    ],
                    [
                        'src' => '/videos/spa-massage.mp4',
                        'fallback' => 'https://assets.mixkit.co/videos/41710/41710-720.mp4',
                        'title' => 'Authentic Balinese Massage'
                    ]
                ]
            ],
            'services' => [
                ['name' => 'Body Massage', 'image' => 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=1470&auto=format&fit=crop'],
                ['name' => 'Scrub & Mask', 'image' => 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1470&auto=format&fit=crop'],
                ['name' => 'Hair Treatment', 'image' => 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1469&auto=format&fit=crop'],
                ['name' => 'Manicure & Pedicure', 'image' => 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=1469&auto=format&fit=crop'],
                ['name' => 'Kids Menu', 'image' => 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=1471&auto=format&fit=crop'],
                ['name' => 'Short Treatment', 'image' => 'https://images.unsplash.com/photo-1608283088514-63390cc69eb4?q=80&w=1470&auto=format&fit=crop']
            ],
            'experience' => [
                [
                    'image' => 'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=1470&auto=format&fit=crop',
                    'text1' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    'text2' => 'Sed do eiusmod tempor incididunt ut labore et dolore',
                    'text3' => 'magna aliqua.'
                ],
                [
                    'image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop',
                    'text1' => 'Experience world-class rejuvenation and tranquil ambiance.',
                    'text2' => 'Curated wellness treatments nestled in Bali Collection',
                    'text3' => 'designed for your ultimate peace.'
                ],
                [
                    'image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop',
                    'text1' => 'Authentic botanical healing and warm herbal aromatherapy.',
                    'text2' => 'Restoring mind, body, and soul through timeless rituals',
                    'text3' => 'at Sadali Spa & Salon.'
                ]
            ],
            'blog' => [
                [
                    'category' => 'Traditions',
                    'title' => 'The Secrets of Balinese Healing',
                    'description' => 'Discover ancient herbs and time-honored pressure point techniques used for centuries in Bali to restore bodily equilibrium.',
                    'image' => 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop'
                ],
                [
                    'category' => 'Beauty & Nails',
                    'title' => 'Holistic Luxury Nail Care',
                    'description' => 'Nourish your nails with organic botanicals and premium essential oils during your blissful holiday in Nusa Dua.',
                    'image' => 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=800&auto=format&fit=crop'
                ],
                [
                    'category' => 'Aromatherapy',
                    'title' => 'Calming Scents for Island Living',
                    'description' => 'How pure frangipani and lemongrass extracts awaken the senses and reduce fatigue after traveling across Bali.',
                    'image' => 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop'
                ]
            ]
        ]
    ]);
})->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';

require __DIR__.'/cms.php';

require __DIR__.'/page-delivery.php';

require __DIR__.'/cms-panel.php';

require __DIR__.'/brand-custom.php';

require __DIR__.'/acala-compat.php';
