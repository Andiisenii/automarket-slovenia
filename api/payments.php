<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? '';
    
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }
    
    $stmt = $conn->query("SELECT p.*, c.brand, c.model, c.title as car_title FROM payments p LEFT JOIN cars c ON p.car_id = c.id WHERE p.user_id = $userId ORDER BY p.created_at DESC");
    $payments = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'payments' => $payments]);
    
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'create') {
        $userId = intval($input['user_id'] ?? 0);
        $carId = intval($input['car_id'] ?? 0);
        $amount = floatval($input['amount'] ?? 0);
        $package = addslashes($input['package'] ?? 'basic');
        
        if (!$userId || !$amount) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }
        
        // Generate transaction ID
        $transactionId = 'TXN_' . time() . '_' . rand(1000, 9999);
        
        try {
            // Create payment record (status: pending)
            $conn->exec("INSERT INTO payments (user_id, car_id, amount, package, status, transaction_id) VALUES ($userId, " . ($carId ? $carId : "NULL") . ", $amount, '$package', 'pending', '$transactionId')");
            $paymentId = $conn->lastInsertId();
            
            // For demo: auto-complete the payment
            $conn->exec("UPDATE payments SET status = 'completed' WHERE id = $paymentId");
            
            // If car_id exists, promote/activate the car
            if ($carId) {
                $boostPackage = $package === 'premium' ? 'top' : ($package === 'featured' ? 'akcija' : 'skok');
                $conn->exec("UPDATE cars SET promoted = 1, boost_package = '$boostPackage', status = 'active' WHERE id = $carId");
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Payment successful',
                'payment' => [
                    'id' => $paymentId,
                    'transaction_id' => $transactionId,
                    'amount' => $amount,
                    'status' => 'completed'
                ]
            ]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Payment failed: ' . $e->getMessage()]);
        }
        
    } elseif ($action === 'verify') {
        $transactionId = addslashes($input['transaction_id'] ?? '');
        echo json_encode(['success' => true, 'verified' => true]);
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
