<?php
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all tables
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'tables' => $tables,
        'count' => count($tables)
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>