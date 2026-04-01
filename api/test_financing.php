<?php
// Test API
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all cars with financing
    $stmt = $conn->query("SELECT c.*, u.name as seller_name FROM cars c JOIN users u ON c.user_id = u.id WHERE c.status = 'active' AND c.has_financing = 1 ORDER BY c.promoted DESC, c.created_at DESC");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($cars as &$car) {
        $car['images'] = json_decode($car['images'] ?? '[]', true);
    }
    
    echo json_encode(['success' => true, 'cars' => $cars, 'count' => count($cars)]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
