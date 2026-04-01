<?php
// Check car data
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all cars with new fields
    $stmt = $conn->query("SELECT id, brand, model, engine, horsepower, color, has_financing, monthly_budget FROM cars LIMIT 5");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'cars' => $cars]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
