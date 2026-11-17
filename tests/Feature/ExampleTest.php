<?php

it('redirects guests to the login screen', function () {
    $response = $this->get('/');

    $response->assertRedirect(route('login'));
});
