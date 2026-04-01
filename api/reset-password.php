<?php
/**
 * Reset Password API
 * Verifies code and sets new password
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$token = trim($data['token'] ?? '');
$newPassword = $data['newPassword'] ?? '';

if (empty($email) || empty($token) || empty($newPassword)) {
    echo json_encode(['success' => false, 'message' => 'Vsa polja so obvezna']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Neveljaven email']);
    exit;
}

if (strlen($newPassword) < 6) {
    echo json_encode(['success' => false, 'message' => 'Geslo mora imeti vsaj 6 znakov']);
    exit;
}

// Find user with matching token and non-expired
$now = date('Y-m-d H:i:s');
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_expires > ?");
$stmt->bind_param("sss", $email, $token, $now);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Neveljavna ali potekla koda. Prosimo, zahtevajte novo kodo.']);
    exit;
}

$user = $result->fetch_assoc();

// Hash and update password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
$stmt->bind_param("si", $hashedPassword, $user['id']);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Geslo uspesno spremenjeno!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Napaka pri spreminjanju gesla']);
}
?>
