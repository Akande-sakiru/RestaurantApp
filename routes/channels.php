<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all the channels that your application supports.
| The Broadcast::channel method will receive the authenticated user that
| is attempting to connect to a private broadcast channel and return
| the user ID if the user is authorized to listen.
|
*/

Broadcast::channel('orders.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('admin.orders', function ($user) {
    return $user->hasRole('admin');
});

Broadcast::channel('reservations.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
