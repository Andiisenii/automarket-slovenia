<?php
// Check and create favorites table
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'automarket';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if favorites table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'favorites'");
    if ($stmt->rowCount() == 0) {
        // Create favorites table
        $conn->exec("CREATE TABLE IF NOT EXISTS favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            car_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
            UNIQUE KEY unique_favorite (user_id, car_id)
        )");
        echo json_encode(['success' => true, 'message' => 'Favorites table created']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Favorites table already exists']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
