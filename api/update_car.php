<?php
// Update sample car with new fields
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Update the existing car with sample data
    $stmt = $conn->prepare("UPDATE cars SET engine = ?, horsepower = ?, color = ? WHERE id = 3");
    $stmt->execute(['3.0 TDI', 245, 'black']);
    
    echo json_encode(['success' => true, 'message' => 'Car updated with sample data']);
    
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
