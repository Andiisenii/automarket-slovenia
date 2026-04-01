<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'register') {
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $phone = $input['phone'] ?? '';
        $password = $input['password'] ?? '';
        
        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }
        
        // Check if email exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            exit;
        }
        
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $conn->prepare("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)");
        
        try {
            $stmt->execute([$name, $email, $phone, $hashed]);
            $userId = $conn->lastInsertId();
            
            // Generate session token (cookie)
            $sessionToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)); // 30 days
            
            $stmt = $conn->prepare("INSERT INTO user_sessions (user_id, session_token, user_agent, expires_at) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userId, $sessionToken, $_SERVER['HTTP_USER_AGENT'] ?? '', $expiresAt]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'id' => $userId,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'profile_photo' => null
                ],
                'token' => $sessionToken
            ]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Registration failed']);
        }
        
    } elseif ($action === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $rememberMe = $input['remember_me'] ?? false;
        
        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Email and password required']);
            exit;
        }
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            exit;
        }
        
        // Generate session token
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = $rememberMe 
            ? date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60))  // 30 days
            : date('Y-m-d H:i:s', time() + (24 * 60 * 60));       // 1 day
        
        $stmt = $conn->prepare("INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user['id'], $sessionToken, $_SERVER['REMOTE_ADDR'] ?? '', $_SERVER['HTTP_USER_AGENT'] ?? '', $expiresAt]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'profile_photo' => $user['profile_photo'],
                'role' => $user['role']
            ],
            'token' => $sessionToken
        ]);
        
    } elseif ($action === 'logout') {
        $token = $input['token'] ?? '';
        
        if ($token) {
            $conn->prepare("DELETE FROM user_sessions WHERE session_token = ?")->execute([$token]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Logged out']);
        
    } elseif ($action === 'update_profile') {
        $userId = $input['user_id'] ?? '';
        $name = $input['name'] ?? '';
        $username = $input['username'] ?? '';
        $phone = $input['phone'] ?? '';
        $whatsapp = $input['whatsapp'] ?? '';
        $viber = $input['viber'] ?? '';
        $profilePhoto = $input['profile_photo'] ?? '';
        $hasPhone = isset($input['hasPhone']) ? ($input['hasPhone'] ? 1 : 0) : null;
        $hasWhatsapp = isset($input['hasWhatsapp']) ? ($input['hasWhatsapp'] ? 1 : 0) : null;
        $hasViber = isset($input['hasViber']) ? ($input['hasViber'] ? 1 : 0) : null;
        
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            exit;
        }
        
        $fields = [];
        $params = [];
        
        if ($name) { $fields[] = 'name = ?'; $params[] = $name; }
        if ($username) { $fields[] = 'username = ?'; $params[] = $username; }
        if ($phone) { $fields[] = 'phone = ?'; $params[] = $phone; }
        if ($whatsapp) { $fields[] = 'whatsapp = ?'; $params[] = $whatsapp; }
        if ($viber) { $fields[] = 'viber = ?'; $params[] = $viber; }
        if ($profilePhoto) { $fields[] = 'profile_photo = ?'; $params[] = $profilePhoto; }
        if ($hasPhone !== null) { $fields[] = 'has_phone = ?'; $params[] = $hasPhone; }
        if ($hasWhatsapp !== null) { $fields[] = 'has_whatsapp = ?'; $params[] = $hasWhatsapp; }
        if ($hasViber !== null) { $fields[] = 'has_viber = ?'; $params[] = $hasViber; }
        
        if (empty($fields)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit;
        }
        
        $params[] = $userId;
        
        try {
            $conn->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
            
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'username' => $user['username'] ?? '',
                    'email' => $user['email'],
                    'phone' => $user['phone'] ?? '',
                    'whatsapp' => $user['whatsapp'] ?? '',
                    'viber' => $user['viber'] ?? '',
                    'has_phone' => $user['has_phone'] ?? 1,
                    'has_whatsapp' => $user['has_whatsapp'] ?? 0,
                    'has_viber' => $user['has_viber'] ?? 0,
                    'profile_photo' => $user['profile_photo'] ?? ''
                ]
            ]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Update failed']);
        }
        
    } elseif ($action === 'verify_session') {
        $token = $input['token'] ?? '';
        
        if (!$token) {
            echo json_encode(['success' => false, 'message' => 'Token required']);
            exit;
        }
        
        $stmt = $conn->prepare("SELECT u.*, s.expires_at FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > NOW()");
        $stmt->execute([$token]);
        $session = $stmt->fetch();
        
        if ($session) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $session['id'],
                    'name' => $session['name'],
                    'username' => $session['username'] ?? '',
                    'email' => $session['email'],
                    'phone' => $session['phone'] ?? '',
                    'whatsapp' => $session['whatsapp'] ?? '',
                    'viber' => $session['viber'] ?? '',
                    'has_phone' => $session['has_phone'] ?? 1,
                    'has_whatsapp' => $session['has_whatsapp'] ?? 0,
                    'has_viber' => $session['has_viber'] ?? 0,
                    'profile_photo' => $session['profile_photo'] ?? '',
                    'role' => $session['role']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Session expired']);
        }
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
    
} elseif ($method === 'GET') {
    $token = $_GET['token'] ?? '';
    
    if ($token) {
        $stmt = $conn->prepare("SELECT u.*, s.expires_at FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > NOW()");
        $stmt->execute([$token]);
        $session = $stmt->fetch();
        
        if ($session) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $session['id'],
                    'name' => $session['name'],
                    'email' => $session['email'],
                    'phone' => $session['phone'],
                    'profile_photo' => $session['profile_photo'],
                    'role' => $session['role']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid session']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No token provided']);
    }
}
