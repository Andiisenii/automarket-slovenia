<?php
$conn = new PDO("mysql:host=localhost;dbname=automarket", "root", "");
$tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo json_encode($tables);
?>