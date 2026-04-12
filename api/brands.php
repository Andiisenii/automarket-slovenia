<?php
/**
 * AutoMarket Slovenia - Brands & Models API
 * Get all brands and their models
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Pinggy-No-Screen');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host = 'localhost';
$dbname = 'automarket_slovenia';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Fallback to Supabase if MySQL fails
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? 'all';

switch ($action) {
    case 'brands':
        // Get all brands
        $stmt = $pdo->query("SELECT id, name FROM brands ORDER BY name");
        $brands = $stmt->fetchAll();
        echo json_encode(['brands' => $brands]);
        break;
        
    case 'models':
        // Get models for a specific brand
        $brandId = $_GET['brand_id'] ?? null;
        $brandName = $_GET['brand'] ?? null;
        
        if ($brandId) {
            $stmt = $pdo->prepare("SELECT id, name FROM models WHERE brand_id = ? ORDER BY name");
            $stmt->execute([$brandId]);
        } elseif ($brandName) {
            $stmt = $pdo->prepare("
                SELECT m.id, m.name 
                FROM models m 
                JOIN brands b ON m.brand_id = b.id 
                WHERE b.name LIKE ? 
                ORDER BY m.name
            ");
            $stmt->execute([$brandName]);
        } else {
            // Get all models
            $stmt = $pdo->query("SELECT id, name, brand_id FROM models ORDER BY name");
        }
        $models = $stmt->fetchAll();
        echo json_encode(['models' => $models]);
        break;
        
    case 'search':
        // Search brands by name (for autocomplete)
        $query = $_GET['q'] ?? '';
        $limit = intval($_GET['limit'] ?? 10);
        
        if (empty($query)) {
            echo json_encode(['brands' => [], 'models' => []]);
            break;
        }
        
        // Search brands
        $stmt = $pdo->prepare("
            SELECT id, name FROM brands 
            WHERE name LIKE ? 
            ORDER BY name 
            LIMIT ?
        ");
        $stmt->execute(['%' . $query . '%', $limit]);
        $brands = $stmt->fetchAll();
        
        // Search models
        $stmt = $pdo->prepare("
            SELECT m.id, m.name, b.name as brand_name, m.brand_id
            FROM models m 
            JOIN brands b ON m.brand_id = b.id 
            WHERE m.name LIKE ? OR b.name LIKE ?
            ORDER BY m.name 
            LIMIT ?
        ");
        $stmt->execute(['%' . $query . '%', '%' . $query . '%', $limit]);
        $models = $stmt->fetchAll();
        
        echo json_encode([
            'brands' => $brands,
            'models' => $models
        ]);
        break;
        
    case 'all':
    default:
        // Get all brands with their models
        $stmt = $pdo->query("SELECT id, name FROM brands ORDER BY name");
        $brands = $stmt->fetchAll();
        
        foreach ($brands as &$brand) {
            $stmt = $pdo->prepare("SELECT id, name FROM models WHERE brand_id = ? ORDER BY name");
            $stmt->execute([$brand['id']]);
            $brand['models'] = $stmt->fetchAll();
        }
        
        echo json_encode(['brands' => $brands]);
        break;
}
?>
