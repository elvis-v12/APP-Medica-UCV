<?php
session_start();
include '../../Cliente/Modelo/conexion.php';

$response = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Preparar la consulta SQL para seleccionar datos del usuario con rol de administrador
    $sql = "SELECT * FROM usuarios WHERE correo_institucional = :email AND id_rol = 2";

    try {
        $stmt = $db->prepare($sql);
        $stmt->execute(['email' => $email]);

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            if ($usuario['estado'] == 1) { // Verificar si la cuenta está activa
                if (password_verify($password, $usuario["clave"])) {
                    $_SESSION['usuario_id'] = $usuario['id_usuario'];
                    $_SESSION['usuario_nombre'] = $usuario['nombre'];

                    // Obtener el id_usuario del administrador
                    $id_usuario = $usuario['id_usuario'];

                    // Actualizar registroacceso: id_tipo a 1 (Activo) y fecha_hora a NOW()
                    $sqlUpdate = "UPDATE registroacceso SET id_tipo = 1, fecha_hora = NOW() WHERE id_usuario = :id_usuario";
                    $stmtUpdate = $db->prepare($sqlUpdate);
                    $stmtUpdate->bindParam(':id_usuario', $id_usuario);
                    $stmtUpdate->execute();

                    $response = ['success' => true, 'message' => 'Inicio de sesión exitoso', 'redirect' => '../Vista/admin-main.html'];
                } else {
                    $response = ['success' => false, 'message' => 'El correo electrónico o la contraseña no son válidos, inténtelo de nuevo.'];
                }
            } else {
                $response = ['success' => false, 'message' => 'Verifique la cuenta de correo electrónico antes de iniciar sesión.'];
            }
        } else {
            $response = ['success' => false, 'message' => 'Lo sentimos, sus credenciales no son válidas.'];
        }
    } catch (PDOException $e) {
        $response = ['success' => false, 'message' => 'No se pudo iniciar sesión: ' . $e->getMessage()];
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>
