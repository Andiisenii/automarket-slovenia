<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $carId = $_GET['id'] ?? '';
    $financingOnly = $_GET['financing'] ?? '';
    $limit = $_GET['limit'] ?? '';
    
    if ($carId) {
        $stmt = $conn->prepare("SELECT c.*, u.name as seller_name, u.phone as seller_phone, u.email as seller_email, u.profile_photo as seller_photo, u.has_phone as seller_has_phone, u.has_whatsapp as seller_has_whatsapp, u.has_viber as seller_has_viber FROM cars c JOIN users u ON c.user_id = u.id WHERE c.id = ? AND c.status = 'active'");
        $stmt->execute([$carId]);
        $car = $stmt->fetch();
        
        if ($car) {
            $conn->exec("UPDATE cars SET views = views + 1 WHERE id = $carId");
            $car['images'] = json_decode($car['images'] ?? '[]', true);
            $car['financing_details'] = json_decode($car['financing_details'] ?? '{}', true);
            echo json_encode(['success' => true, 'car' => $car]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Car not found']);
        }
    } else {
        $whereClause = "c.status = 'active'";
        if ($financingOnly === 'true') {
            $whereClause .= " AND c.has_financing = 1";
        }
        $limitClause = $limit ? "LIMIT " . intval($limit) : "";
        $stmt = $conn->query("SELECT c.*, u.name as seller_name, u.profile_photo as seller_photo FROM cars c JOIN users u ON c.user_id = u.id WHERE $whereClause ORDER BY c.promoted DESC, c.created_at DESC $limitClause");
        $cars = $stmt->fetchAll();
        
        foreach ($cars as &$car) {
            $car['images'] = json_decode($car['images'] ?? '[]', true);
            $car['financing_details'] = json_decode($car['financing_details'] ?? '{}', true);
        }
        
        echo json_encode(['success' => true, 'cars' => $cars]);
    }
    
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'create') {
        $userId = intval($input['user_id'] ?? 0);
        $brand = addslashes($input['brand'] ?? '');
        $model = addslashes($input['model'] ?? '');
        $title = addslashes($input['title'] ?? "$brand $model");
        $description = addslashes($input['description'] ?? '');
        $price = floatval($input['price'] ?? 0);
        $monthlyBudget = isset($input['monthly_budget']) ? floatval($input['monthly_budget']) : 'NULL';
        $year = intval($input['year'] ?? 2024);
        $mileage = intval($input['mileage'] ?? 0);
        $fuelType = addslashes($input['fuel_type'] ?? '');
        $transmission = addslashes($input['transmission'] ?? '');
        $bodyType = addslashes($input['body_type'] ?? '');
        $engine = addslashes($input['engine'] ?? '');
        $horsepower = intval($input['horsepower'] ?? 0);
        $color = addslashes($input['color'] ?? '');
        $city = addslashes($input['city'] ?? '');
        
        $images = json_encode($input['images'] ?? []);
        
        $hasFinancing = $input['has_financing'] ? 1 : 0;
        $downPaymentType = addslashes($input['down_payment_type'] ?? '');
        $downPaymentValue = isset($input['down_payment_value']) ? floatval($input['down_payment_value']) : 'NULL';
        
        $sellerType = addslashes($input['seller_type'] ?? 'private');
        $companyName = addslashes($input['company_name'] ?? '');
        $companyId = addslashes($input['company_id'] ?? '');
        $financingDetails = isset($input['financing_details']) ? json_encode($input['financing_details']) : 'NULL';
        $warranty = addslashes($input['warranty'] ?? '');
        $registrationNumber = addslashes($input['registration_number'] ?? '');
        
        if (empty($userId) || empty($brand) || empty($model) || empty($price)) {
            echo json_encode(['success' => false, 'message' => 'Required fields missing']);
            exit;
        }
        
        $monthlyBudgetStr = is_numeric($monthlyBudget) ? $monthlyBudget : 'NULL';
        $downPaymentValueStr = is_numeric($downPaymentValue) ? $downPaymentValue : 'NULL';
        
        $sql = "INSERT INTO cars (user_id, seller_type, company_name, company_id, brand, model, title, description, price, monthly_budget, year, mileage, fuel_type, transmission, body_type, engine, horsepower, color, city, images, has_financing, down_payment_type, down_payment_value, warranty, registration_number) 
                VALUES ($userId, '$sellerType', '$companyName', '$companyId', '$brand', '$model', '$title', '$description', $price, $monthlyBudgetStr, $year, $mileage, '$fuelType', '$transmission', '$bodyType', '$engine', $horsepower, '$color', '$city', '$images', $hasFinancing, '$downPaymentType', $downPaymentValueStr, '$warranty', '$registrationNumber')";
        
        try {
            $conn->exec($sql);
            $carId = $conn->lastInsertId();
            echo json_encode(['success' => true, 'car_id' => $carId]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
        
    } elseif ($action === 'update') {
        $carId = intval($input['id'] ?? 0);
        $userId = intval($input['user_id'] ?? 0);
        
        $stmt = $conn->query("SELECT user_id FROM cars WHERE id = $carId");
        $car = $stmt->fetch();
        
        if (!$car || $car['user_id'] != $userId) {
            echo json_encode(['success' => false, 'message' => 'Not authorized']);
            exit;
        }
        
        $updates = [];
        $updatable = ['brand', 'model', 'title', 'description', 'price', 'monthly_budget', 'year', 'mileage', 'fuel_type', 'transmission', 'body_type', 'engine', 'horsepower', 'color', 'city', 'has_financing', 'down_payment_type', 'down_payment_value', 'status', 'seller_type', 'company_name', 'company_id', 'warranty', 'registration_number', 'sold_at', 'sold_where', 'sold_comment', 'promoted_until', 'has_boost', 'boost_spent', 'boost_days', 'boost_price_per_day'];
        
        foreach ($updatable as $field) {
            if (isset($input[$field])) {
                $val = is_numeric($input[$field]) ? $input[$field] : "'" . addslashes($input[$field]) . "'";
                $updates[] = "$field = $val";
            }
        }
        
        if (isset($input['images'])) {
            $updates[] = "images = '" . json_encode($input['images']) . "'";
        }
        
        if (isset($input['financing_details'])) {
            $updates[] = "financing_details = '" . json_encode($input['financing_details']) . "'";
        }
        
        if (isset($input['promoted'])) {
            $updates[] = "promoted = " . ($input['promoted'] ? 1 : 0);
            if (isset($input['boost_package'])) {
                $updates[] = "boost_package = '" . addslashes($input['boost_package']) . "'";
            }
        }
        
        if (empty($updates)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit;
        }
        
        $sql = "UPDATE cars SET " . implode(', ', $updates) . " WHERE id = $carId";
        
        try {
            $conn->exec($sql);
            echo json_encode(['success' => true, 'message' => 'Car updated']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Update failed']);
        }
        
    } elseif ($action === 'delete') {
        $carId = intval($input['id'] ?? 0);
        $userId = intval($input['user_id'] ?? 0);
        
        $stmt = $conn->query("SELECT user_id FROM cars WHERE id = $carId");
        $car = $stmt->fetch();
        
        if (!$car || $car['user_id'] != $userId) {
            echo json_encode(['success' => false, 'message' => 'Not authorized']);
            exit;
        }
        
        $conn->exec("DELETE FROM cars WHERE id = $carId");
        echo json_encode(['success' => true, 'message' => 'Car deleted']);
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
