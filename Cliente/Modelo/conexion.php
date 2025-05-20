<?php

$host = 'localhost';
$dbname = 'appmedica';
$user = 'root';
$pass = '';

try{
    $db = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e){
    echo "Error al conectar a la base de datos: " . $e->getMessage();
    exit;
}
?>