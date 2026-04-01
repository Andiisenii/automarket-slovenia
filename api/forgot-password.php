<?php
/**
 * Forgot Password API
 * Sends password reset email to user
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
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email je obvezen']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Neveljaven email naslov']);
    exit;
}

// Find user by email
$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Don't reveal if email exists or not (security)
    echo json_encode(['success' => true, 'message' => 'Ce email obstaja, smo poslali navodila za ponastavitev']);
    exit;
}

$user = $result->fetch_assoc();

// Generate 6-digit reset code
$token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

// Save token to database
$stmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
$stmt->bind_param("ssi", $token, $expires, $user['id']);
$stmt->execute();

// Send email
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'info@vozilo.si';
    $mail->Password   = '6.jbtt ycrk rkfh eobj'; // App password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // Recipients
    $mail->setFrom('info@vozilo.si', 'Vozilo.si');
    $mail->addAddress($email, $user['name']);

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Ponastavitev gesla - Vozilo.si';
    $mail->Body    = '
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6a00;">Pozdravljeni ' . htmlspecialchars($user['name']) . '!</h2>
        <p>Prejeli smo zahtevo za ponastavitev gesla za vaš račun na <strong>Vozilo.si</strong>.</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
            <p style="margin: 0; font-size: 14px; color: #666;">Vaša koda za ponastavitev:</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">' . $token . '</p>
        </div>
        <p><strong>Koda velja 15 minut.</strong></p>
        <p>Če niste zahtevali ponastavitev gesla, lahko to sporočilo prezrete.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Lep pozdrav,<br>Ekipa Vozilo.si</p>
    </div>
    ';

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email poslan! Preverite svojo postavko.']);

} catch (Exception $e) {
    error_log("Mail Error: " . $mail->ErrorInfo);
    echo json_encode(['success' => false, 'message' => 'Napaka pri posiljanju emaila. Poskusite znova.']);
}
?>
