<?php
// Update database with new fields
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $results = [];
    
    // Add columns to users table
    $userColumns = [
        'username' => 'ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER name',
        'whatsapp' => 'ALTER TABLE users ADD COLUMN whatsapp VARCHAR(20) AFTER phone',
        'viber' => 'ALTER TABLE users ADD COLUMN viber VARCHAR(20) AFTER whatsapp',
        'profile_photo' => 'ALTER TABLE users ADD COLUMN profile_photo TEXT AFTER viber',
    ];
    
    foreach ($userColumns as $column => $sql) {
        try {
            $conn->exec($sql);
            $results[] = "Added: $column";
        } catch(PDOException $e) {
            $results[] = "$column: " . $e->getMessage();
        }
    }
    
    // Add column to cars table if not exists
    try {
        $conn->exec("ALTER TABLE cars ADD COLUMN can_finance BOOLEAN DEFAULT FALSE AFTER has_financing");
        $results[] = "Added: can_finance to cars";
    } catch(PDOException $e) {
        $results[] = "can_finance: " . $e->getMessage();
    }
    
    echo json_encode(['success' => true, 'results' => $results]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
