<?php
// Database update script
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $results = [];
    
    // Check if columns exist and add if not
    $columnsToAdd = [
        'engine' => 'ALTER TABLE cars ADD COLUMN engine VARCHAR(100) AFTER body_type',
        'horsepower' => 'ALTER TABLE cars ADD COLUMN horsepower INT AFTER engine',
        'color' => 'ALTER TABLE cars ADD COLUMN color VARCHAR(50) AFTER horsepower',
    ];
    
    foreach ($columnsToAdd as $column => $sql) {
        try {
            // Check if column exists
            $stmt = $conn->query("SHOW COLUMNS FROM cars LIKE '$column'");
            if ($stmt->rowCount() == 0) {
                $conn->exec($sql);
                $results[] = "Added column: $column";
            } else {
                $results[] = "Column already exists: $column";
            }
        } catch (PDOException $e) {
            $results[] = "Error adding $column: " . $e->getMessage();
        }
    }
    
    echo json_encode(['success' => true, 'results' => $results]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}
