<?php
// API Router
header('Content-Type: application/json');

$request = $_GET['request'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'auth' => 'auth.php',
    'cars' => 'cars.php',
    'favorites' => 'favorites.php',
    'messages' => 'messages.php',
];

$parts = explode('/', $request);
$endpoint = $parts[0] ?? '';

if (isset($routes[$endpoint])) {
    require_once $routes[$endpoint];
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'API endpoint not found',
        'available_endpoints' => array_keys($routes)
    ]);
}
