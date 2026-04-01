<?php
// Add contact option columns to users table
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $results = [];
    
    $columns = [
        'has_phone' => 'ALTER TABLE users ADD COLUMN has_phone TINYINT(1) DEFAULT 1',
        'has_whatsapp' => 'ALTER TABLE users ADD COLUMN has_whatsapp TINYINT(1) DEFAULT 0',
        'has_viber' => 'ALTER TABLE users ADD COLUMN has_viber TINYINT(1) DEFAULT 0',
    ];
    
    foreach ($columns as $col => $sql) {
        try {
            $conn->exec($sql);
            $results[] = "Added: $col";
        } catch(PDOException $e) {
            $results[] = "$col: already exists or error";
        }
    }
    
    echo json_encode(['success' => true, 'results' => $results]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
