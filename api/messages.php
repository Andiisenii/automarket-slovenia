<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get messages for user
    $userId = $_GET['user_id'] ?? '';
    $type = $_GET['type'] ?? 'inbox'; // inbox or sent
    
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }
    
    if ($type === 'inbox') {
        $stmt = $conn->prepare("SELECT m.*, u.name as sender_name, u.email as sender_email,
                                c.brand, c.model, c.title as car_title
                                FROM messages m
                                JOIN users u ON m.sender_id = u.id
                                LEFT JOIN cars c ON m.car_id = c.id
                                WHERE m.receiver_id = ?
                                ORDER BY m.created_at DESC");
    } else {
        $stmt = $conn->prepare("SELECT m.*, u.name as receiver_name, u.email as receiver_email,
                                c.brand, c.model, c.title as car_title
                                FROM messages m
                                JOIN users u ON m.receiver_id = u.id
                                LEFT JOIN cars c ON m.car_id = c.id
                                WHERE m.sender_id = ?
                                ORDER BY m.created_at DESC");
    }
    
    $stmt->execute([$userId]);
    $messages = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'messages' => $messages]);
    
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'send') {
        $senderId = $input['sender_id'] ?? '';
        $receiverId = $input['receiver_id'] ?? '';
        $carId = $input['car_id'] ?? null;
        $message = $input['message'] ?? '';
        
        if (!$senderId || !$receiverId || empty($message)) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }
        
        try {
            $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, car_id, message) VALUES (?, ?, ?, ?)");
            $stmt->execute([$senderId, $receiverId, $carId, $message]);
            echo json_encode(['success' => true, 'message' => 'Message sent']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to send message']);
        }
        
    } elseif ($action === 'mark_read') {
        $messageId = $input['message_id'] ?? '';
        
        if (!$messageId) {
            echo json_encode(['success' => false, 'message' => 'Message ID required']);
            exit;
        }
        
        try {
            $conn->prepare("UPDATE messages SET is_read = 1 WHERE id = ?")->execute([$messageId]);
            echo json_encode(['success' => true, 'message' => 'Marked as read']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to mark as read']);
        }
        
    } elseif ($action === 'delete') {
        $messageId = $input['message_id'] ?? '';
        $userId = $input['user_id'] ?? '';
        
        if (!$messageId || !$userId) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }
        
        // Check ownership
        $stmt = $conn->prepare("SELECT id FROM messages WHERE id = ? AND (sender_id = ? OR receiver_id = ?)");
        $stmt->execute([$messageId, $userId, $userId]);
        
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Not authorized']);
            exit;
        }
        
        try {
            $conn->prepare("DELETE FROM messages WHERE id = ?")->execute([$messageId]);
            echo json_encode(['success' => true, 'message' => 'Message deleted']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to delete message']);
        }
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
