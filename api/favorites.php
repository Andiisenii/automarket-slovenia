<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get user's favorites
    $userId = $_GET['user_id'] ?? '';
    
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }
    
    $stmt = $conn->prepare("SELECT c.*, f.created_at as favorited_at 
                            FROM favorites f 
                            JOIN cars c ON f.car_id = c.id 
                            WHERE f.user_id = ? AND c.status = 'active'
                            ORDER BY f.created_at DESC");
    $stmt->execute([$userId]);
    $favorites = $stmt->fetchAll();
    
    // Decode images
    foreach ($favorites as &$fav) {
        $fav['images'] = json_decode($fav['images'] ?? '[]', true);
    }
    
    echo json_encode(['success' => true, 'favorites' => $favorites]);
    
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $userId = $input['user_id'] ?? '';
    $carId = $input['car_id'] ?? '';
    
    if (!$userId || !$carId) {
        echo json_encode(['success' => false, 'message' => 'User ID and Car ID required']);
        exit;
    }
    
    if ($action === 'add') {
        // Add to favorites
        try {
            $stmt = $conn->prepare("INSERT IGNORE INTO favorites (user_id, car_id) VALUES (?, ?)");
            $stmt->execute([$userId, $carId]);
            echo json_encode(['success' => true, 'message' => 'Added to favorites']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to add favorite']);
        }
        
    } elseif ($action === 'remove') {
        // Remove from favorites
        try {
            $stmt = $conn->prepare("DELETE FROM favorites WHERE user_id = ? AND car_id = ?");
            $stmt->execute([$userId, $carId]);
            echo json_encode(['success' => true, 'message' => 'Removed from favorites']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to remove favorite']);
        }
        
    } elseif ($action === 'check') {
        // Check if car is favorited
        $stmt = $conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND car_id = ?");
        $stmt->execute([$userId, $carId]);
        $exists = $stmt->fetch();
        
        echo json_encode(['success' => true, 'is_favorite' => !!$exists]);
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
