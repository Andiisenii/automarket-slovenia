<?php
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get users count
    $users = $conn->query("SELECT COUNT(*) as count FROM users")->fetch(PDO::FETCH_ASSOC);
    
    // Get cars count
    $cars = $conn->query("SELECT COUNT(*) as count FROM cars")->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connected successfully!',
        'users_count' => $users['count'],
        'cars_count' => $cars['count'],
        'tables' => [
            'users', 'cars', 'messages', 'payments', 
            'favorites', 'boost_packages', 'purchases', 'packages'
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'error' => 'Connection failed: ' . $e->getMessage()
    ]);
}
?>