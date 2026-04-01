<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Admin API for AutoMarket Slovenia
// Secure admin operations with authentication and data validation

header('Content-Type: application/json');
ini_set('display_errors', 0);

// Database connection
function getDB() {
    $host = 'localhost';
    $db   = 'automarket';
    $user = 'root';
    $pass = '';
    
    try {
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }
}

// Simple admin auth check (in production, use proper session/JWT)
function checkAdminAuth() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    // Check admin token from localStorage
    $adminData = json_decode($_POST['admin_token'] ?? $_GET['admin_token'] ?? '{}', true);
    
    if (!isset($adminData['role']) || $adminData['role'] !== 'admin') {
        // Check if it's admin login
        $loginData = json_decode(file_get_contents('php://input'), true);
        if (isset($loginData['isAdmin']) && $loginData['isAdmin']) {
            return true;
        }
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    return true;
}

// Hash password for secure storage
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Get action from request
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Route the request
switch ($action) {
    
    // ============ USERS ============
    case 'users':
        checkAdminAuth();
        $db = getDB();
        $stmt = $db->query("SELECT id, name, email, phone, userType, createdAt, isVerified FROM users ORDER BY createdAt DESC");
        $users = $stmt->fetchAll();
        
        // Mask sensitive data
        foreach ($users as &$user) {
            if (isset($user['email'])) {
                $parts = explode('@', $user['email']);
                if (count($parts) === 2) {
                    $user['email'] = substr($parts[0], 0, 2) . '***@' . $parts[1];
                }
            }
        }
        
        echo json_encode(['success' => true, 'users' => $users]);
        break;
        
    case 'user_detail':
        checkAdminAuth();
        $db = getDB();
        $userId = (int)($_GET['id'] ?? 0);
        
        $stmt = $db->prepare("SELECT id, name, email, phone, userType, companyName, companyAddress, city, postalCode, createdAt, isVerified FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            break;
        }
        
        // Mask email
        $parts = explode('@', $user['email'] ?? '');
        if (count($parts) === 2) {
            $user['email'] = substr($parts[0], 0, 2) . '***@' . $parts[1];
        }
        
        // Get user's cars
        $stmt = $db->prepare("SELECT id, title, price, status, views, createdAt FROM cars WHERE user_id = ? ORDER BY createdAt DESC");
        $stmt->execute([$userId]);
        $cars = $stmt->fetchAll();
        
        // Get user's purchases
        $stmt = $db->prepare("SELECT id, package_type, price, purchasedAt, expiresAt, status FROM purchases WHERE user_id = ? ORDER BY purchasedAt DESC");
        $stmt->execute([$userId]);
        $purchases = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true, 
            'user' => $user, 
            'cars' => $cars, 
            'purchases' => $purchases
        ]);
        break;
        
    case 'update_user':
        checkAdminAuth();
        $db = getDB();
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($data['id'] ?? 0);
        
        $allowedFields = ['name', 'phone', 'userType', 'isVerified', 'companyName', 'companyAddress', 'city', 'postalCode'];
        $updates = [];
        $values = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            break;
        }
        
        $values[] = $userId;
        $stmt = $db->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?");
        $stmt->execute($values);
        
        echo json_encode(['success' => true, 'message' => 'User updated']);
        break;
        
    case 'delete_user':
        checkAdminAuth();
        $db = getDB();
        $userId = (int)($_GET['id'] ?? 0);
        
        // Check if user has cars
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM cars WHERE user_id = ?");
        $stmt->execute([$userId]);
        $count = $stmt->fetch()['count'] ?? 0;
        
        if ($count > 0) {
            // Soft delete - just mark as deleted
            $stmt = $db->prepare("UPDATE users SET deletedAt = NOW() WHERE id = ?");
            $stmt->execute([$userId]);
            echo json_encode(['success' => true, 'message' => 'User soft deleted (has ' . $count . ' cars)']);
        } else {
            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            echo json_encode(['success' => true, 'message' => 'User deleted']);
        }
        break;
    
    // ============ CARS ============
    case 'cars':
        checkAdminAuth();
        $db = getDB();
        
        $status = $_GET['status'] ?? 'all';
        $search = $_GET['search'] ?? '';
        
        $query = "SELECT c.*, u.name as seller_name, u.email as seller_email FROM cars c LEFT JOIN users u ON c.user_id = u.id WHERE 1=1";
        $params = [];
        
        if ($status !== 'all') {
            $query .= " AND c.status = ?";
            $params[] = $status;
        }
        
        if ($search) {
            $query .= " AND (c.title LIKE ? OR c.brand LIKE ? OR c.city LIKE ?)";
            $searchTerm = "%$search%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm]);
        }
        
        $query .= " ORDER BY c.createdAt DESC LIMIT 100";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $cars = $stmt->fetchAll();
        
        // Mask seller email
        foreach ($cars as &$car) {
            if (isset($car['seller_email'])) {
                $parts = explode('@', $car['seller_email']);
                if (count($parts) === 2) {
                    $car['seller_email'] = substr($parts[0], 0, 2) . '***@' . $parts[1];
                }
            }
        }
        
        echo json_encode(['success' => true, 'cars' => $cars]);
        break;
        
    case 'car_detail':
        checkAdminAuth();
        $db = getDB();
        $carId = (int)($_GET['id'] ?? 0);
        
        $stmt = $db->prepare("SELECT c.*, u.name as seller_name, u.email as seller_email, u.phone as seller_phone FROM cars c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?");
        $stmt->execute([$carId]);
        $car = $stmt->fetch();
        
        if (!$car) {
            echo json_encode(['success' => false, 'message' => 'Car not found']);
            break;
        }
        
        // Get views history
        $stmt = $db->prepare("SELECT viewDate, views FROM car_views WHERE car_id = ? ORDER BY viewDate DESC LIMIT 30");
        $stmt->execute([$carId]);
        $views = $stmt->fetchAll();
        
        // Get inquiries
        $stmt = $db->prepare("SELECT * FROM messages WHERE car_id = ? ORDER BY createdAt DESC");
        $stmt->execute([$carId]);
        $messages = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'car' => $car, 'views' => $views, 'messages' => $messages]);
        break;
        
    case 'update_car':
        checkAdminAuth();
        $db = getDB();
        $data = json_decode(file_get_contents('php://input'), true);
        $carId = (int)($data['id'] ?? 0);
        
        $allowedFields = ['title', 'price', 'status', 'featured', 'promoted', 'description'];
        $updates = [];
        $values = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            break;
        }
        
        $values[] = $carId;
        $stmt = $db->prepare("UPDATE cars SET " . implode(', ', $updates) . " WHERE id = ?");
        $stmt->execute($values);
        
        echo json_encode(['success' => true, 'message' => 'Car updated']);
        break;
        
    case 'delete_car':
        checkAdminAuth();
        $db = getDB();
        $carId = (int)($_GET['id'] ?? 0);
        
        $stmt = $db->prepare("UPDATE cars SET deletedAt = NOW() WHERE id = ?");
        $stmt->execute([$carId]);
        
        echo json_encode(['success' => true, 'message' => 'Car deleted']);
        break;
    
    // ============ PACKAGES ============
    case 'packages':
        checkAdminAuth();
        $db = getDB();
        $stmt = $db->query("SELECT * FROM packages ORDER BY type, id");
        $packages = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'packages' => $packages]);
        break;
        
    case 'update_package':
        checkAdminAuth();
        $db = getDB();
        $data = json_decode(file_get_contents('php://input'), true);
        $packageId = (int)($data['id'] ?? 0);
        
        $allowedFields = ['name', 'nameEn', 'price', 'days', 'maxCars', 'active'];
        $updates = [];
        $values = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            break;
        }
        
        $values[] = $packageId;
        $stmt = $db->prepare("UPDATE packages SET " . implode(', ', $updates) . " WHERE id = ?");
        $stmt->execute($values);
        
        echo json_encode(['success' => true, 'message' => 'Package updated']);
        break;
        
    case 'create_package':
        checkAdminAuth();
        $db = getDB();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("INSERT INTO packages (type, name, nameEn, price, days, maxCars, active) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['type'] ?? 'publishing',
            $data['name'] ?? 'New Package',
            $data['nameEn'] ?? 'New Package',
            $data['price'] ?? 0,
            $data['days'] ?? 30,
            $data['maxCars'] ?? 10,
            $data['active'] ?? 1
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Package created', 'id' => $db->lastInsertId()]);
        break;
    
    // ============ ANALYTICS ============
    case 'analytics':
        checkAdminAuth();
        $db = getDB();
        
        // Total stats
        $stats = [];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE deletedAt IS NULL");
        $stats['totalUsers'] = $stmt->fetch()['count'] ?? 0;
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM cars WHERE deletedAt IS NULL");
        $stats['totalCars'] = $stmt->fetch()['count'] ?? 0;
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM cars WHERE status = 'active' AND deletedAt IS NULL");
        $stats['activeCars'] = $stmt->fetch()['count'] ?? 0;
        
        $stmt = $db->query("SELECT COALESCE(SUM(price), 0) as total FROM purchases WHERE status = 'active'");
        $stats['totalRevenue'] = $stmt->fetch()['total'] ?? 0;
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM messages");
        $stats['totalMessages'] = $stmt->fetch()['count'] ?? 0;
        
        // Monthly revenue (last 6 months)
        $stmt = $db->query("
            SELECT DATE_FORMAT(purchasedAt, '%Y-%m') as month, 
                   SUM(price) as revenue, 
                   COUNT(*) as purchases 
            FROM purchases 
            WHERE purchasedAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
            GROUP BY DATE_FORMAT(purchasedAt, '%Y-%m') 
            ORDER BY month
        ");
        $monthlyRevenue = $stmt->fetchAll();
        
        // Daily visitors (simulated for demo - in production use real analytics)
        $dailyData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("- $i days"));
            $dailyData[] = [
                'date' => $date,
                'visitors' => rand(20, 100),
                'pageViews' => rand(50, 300),
                'inquiries' => rand(0, 15)
            ];
        }
        
        // Top cars by views
        $stmt = $db->query("SELECT id, title, brand, price, views FROM cars WHERE deletedAt IS NULL ORDER BY views DESC LIMIT 10");
        $topCars = $stmt->fetchAll();
        
        // Top users by listings
        $stmt = $db->query("
            SELECT u.id, u.name, u.userType, COUNT(c.id) as carCount 
            FROM users u 
            LEFT JOIN cars c ON u.id = c.user_id AND c.deletedAt IS NULL 
            GROUP BY u.id 
            ORDER BY carCount DESC 
            LIMIT 10
        ");
        $topUsers = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'stats' => $stats,
            'monthlyRevenue' => $monthlyRevenue,
            'dailyData' => $dailyData,
            'topCars' => $topCars,
            'topUsers' => $topUsers
        ]);
        break;
    
    // ============ PURCHASES ============
    case 'purchases':
        checkAdminAuth();
        $db = getDB();
        
        $status = $_GET['status'] ?? 'all';
        $query = "SELECT p.*, u.name as user_name, u.email as user_email FROM purchases p LEFT JOIN users u ON p.user_id = u.id WHERE 1=1";
        
        if ($status === 'active') {
            $query .= " AND p.expiresAt > NOW()";
        } elseif ($status === 'expired') {
            $query .= " AND p.expiresAt <= NOW()";
        }
        
        $query .= " ORDER BY p.purchasedAt DESC LIMIT 100";
        
        $stmt = $db->query($query);
        $purchases = $stmt->fetchAll();
        
        // Mask email
        foreach ($purchases as &$p) {
            if (isset($p['user_email'])) {
                $parts = explode('@', $p['user_email']);
                if (count($parts) === 2) {
                    $p['user_email'] = substr($parts[0], 0, 2) . '***@' . $parts[1];
                }
            }
        }
        
        echo json_encode(['success' => true, 'purchases' => $purchases]);
        break;
    
    // ============ MESSAGES ============
    case 'messages':
        checkAdminAuth();
        $db = getDB();
        
        $stmt = $db->query("SELECT m.*, c.title as car_title, u.name as sender_name FROM messages m LEFT JOIN cars c ON m.car_id = c.id LEFT JOIN users u ON m.sender_id = u.id ORDER BY m.createdAt DESC LIMIT 100");
        $messages = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'messages' => $messages]);
        break;
        
    case 'mark_message_read':
        checkAdminAuth();
        $db = getDB();
        $messageId = (int)($_GET['id'] ?? 0);
        
        $stmt = $db->prepare("UPDATE messages SET isRead = 1 WHERE id = ?");
        $stmt->execute([$messageId]);
        
        echo json_encode(['success' => true, 'message' => 'Message marked as read']);
        break;
    
    // ============ SETTINGS ============
    case 'settings':
        checkAdminAuth();
        $db = getDB();
        
        $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        
        echo json_encode(['success' => true, 'settings' => $settings]);
        break;
        
    case 'update_settings':
        checkAdminAuth();
        $db = getDB();
        $data = json_decode(file_get_contents('php://input'), true);
        
        foreach ($data as $key => $value) {
            $stmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->execute([$key, $value, $value]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Settings updated']);
        break;
    
    // ============ ADMIN LOGIN (Special case) ============
    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Simple admin check - in production use proper auth
        $adminEmail = $data['email'] ?? '';
        $adminPassword = $data['password'] ?? '';
        
        // For demo: admin@automarket.si / admin123
        if ($adminEmail === 'admin@automarket.si' && $adminPassword === 'admin123') {
            $token = base64_encode(json_encode([
                'role' => 'admin',
                'email' => $adminEmail,
                'loginAt' => time()
            ]));
            
            echo json_encode([
                'success' => true, 
                'token' => $token,
                'admin' => ['email' => $adminEmail, 'role' => 'admin']
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}