<?php
$ch = curl_init('http://localhost/api/cars.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$result = curl_exec($ch);
curl_close($ch);
$data = json_decode($result, true);
foreach($data['cars'] as $c) {
    echo "[{$c['id']}] {$c['brand']} {$c['model']} | fuelType={$c['fuelType']}\n";
}
echo "Total: " . count($data['cars']) . "\n";
