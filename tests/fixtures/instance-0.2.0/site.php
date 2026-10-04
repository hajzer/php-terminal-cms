<?php
/**
 * An Instance's site.php as an operator kept it through 0.2.0: their own
 * order and comments, a key 0.2.0 already stopped reading, one they misspelt,
 * and a value that is an expression rather than a value.
 */
return [
    'title'   => getenv('TCMS_FIXTURE_TITLE') ?: 'a 0.2.0 Instance',
    'tagline' => 'the shape bin/test migrates',
    'logo'    => '/media/logo.svg',

    'lang'      => 'en',
    'languages' => ['sk'],

    /* accent colour, used for links, prompts and the active nav item */
    'accent'  => '#21e08a',

    'listing'     => true,
    'listnig_max' => 10,

    'link_open' => 'here',
    'footer'    => 'Kept as it was written.',

    'categories' => [
        ['slug' => 'about',  'label' => 'about'],
        ['slug' => 'guides', 'label' => 'guides', 'categories' => [
            ['slug' => 'php', 'label' => 'php'],
        ]],
    ],
];
