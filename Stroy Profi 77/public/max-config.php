<?php
declare(strict_types=1);

// Server-only configuration. Environment variables override local values.
return [
    'token' => getenv('MAX_BOT_TOKEN') ?: 'f9LHodD0cOI6itXLiSJFSZLW2Updn_hYGLeISjiEAh9hqAO-WpYMWOKisRvf1rsYMWVhhfIN9KjwZkD0L9pD',
    'chat_id' => getenv('MAX_CHAT_ID') ?: '-79530456867006',
];
