<?php
// Fix profile_photo column type
$c = new PDO('mysql:host=localhost;dbname=automarket', 'root', '');
$c->exec('ALTER TABLE users MODIFY profile_photo TEXT');
echo 'Modified profile_photo to TEXT';
