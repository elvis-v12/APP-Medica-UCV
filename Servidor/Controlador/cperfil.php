<?php
session_start();
include "../../Cliente/Modelo/conexion.php";

try {
    // Verificar la sesión del usuario
    if (!isset($_SESSION['usuario_id'])) {
        echo json_encode(['error' => 'Usuario no autenticado']);
        // Redirigir a la página de inicio de sesión
        header("Location: ../Controlador/cerrarSesion.php");
        exit;
    }

    $id_usuario = $_SESSION['usuario_id'];

    // Verificar si se ha enviado el formulario de edición
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Obtener datos del formulario
        $nombre = $_POST['nombre'];
        $apellido_paterno = $_POST['apellido_paterno'];
        $apellido_materno = $_POST['apellido_materno'];
        $telefono = $_POST['telefono'];
        $carrera = $_POST['carrera'];

        // Verificar si se envió una nueva imagen de perfil
        $img_perfil = null;
        if (isset($_FILES['fotoPerfil']) && $_FILES['fotoPerfil']['error'] === UPLOAD_ERR_OK) {
            // Procesar la imagen y guardarla en una ruta específica
            $img_perfil = subirImagenPerfil($_FILES['fotoPerfil']);
            if (!$img_perfil) {
                echo json_encode(['error' => 'Error al subir la imagen de perfil']);
                exit;
            }
        }

        // Verificar si se enviaron datos de contraseña y confirmación
        if (isset($_POST['clave']) && isset($_POST['confirmar_clave'])) {
            $clave = $_POST['clave'];
            $confirmar_clave = $_POST['confirmar_clave'];

            // Validar que la contraseña y la confirmación coincidan
            if ($clave !== $confirmar_clave) {
                echo json_encode(['error' => 'La contraseña y la confirmación no coinciden']);
                exit;
            }

            // Obtener la contraseña actual del usuario desde la base de datos
            $sql = "SELECT clave FROM usuarios WHERE id_usuario = :id_usuario";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt->execute();
            $hash_clave_bd = $stmt->fetchColumn();

            // Verificar que la contraseña ingresada coincida con la almacenada en la BD
            if (!password_verify($clave, $hash_clave_bd)) {
                echo json_encode(['error' => 'La contraseña actual no es válida']);
                exit;
            }
        }

        // Actualizar los datos del usuario en la base de datos
        $sql_update = "UPDATE usuarios 
                       SET nombre = :nombre, 
                           apellido_paterno = :apellido_paterno, 
                           apellido_materno = :apellido_materno, 
                           telefono = :telefono, 
                           carrera = :carrera, 
                           img_perfil = :img_perfil 
                       WHERE id_usuario = :id_usuario";

        $stmt_update = $db->prepare($sql_update);
        $stmt_update->bindParam(':nombre', $nombre, PDO::PARAM_STR);
        $stmt_update->bindParam(':apellido_paterno', $apellido_paterno, PDO::PARAM_STR);
        $stmt_update->bindParam(':apellido_materno', $apellido_materno, PDO::PARAM_STR);
        $stmt_update->bindParam(':telefono', $telefono, PDO::PARAM_STR);
        $stmt_update->bindParam(':carrera', $carrera, PDO::PARAM_STR);
        $stmt_update->bindParam(':img_perfil', $img_perfil, PDO::PARAM_STR);
        $stmt_update->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);

        if ($stmt_update->execute()) {
            // Devolver respuesta exitosa
            echo json_encode(['success' => 'Perfil actualizado correctamente']);
            exit;
        } else {
            echo json_encode(['error' => 'Error al actualizar el perfil']);
            exit;
        }
    } else {
        // Si no se envió por POST, obtener y devolver los datos del usuario para mostrar en el perfil
        $sql = "SELECT nombre, apellido_paterno, apellido_materno, telefono, correo_institucional, carrera, img_perfil 
                FROM usuarios 
                WHERE id_usuario = :id_usuario";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();

        // Obtener los datos del usuario
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(['error' => 'Usuario no encontrado']);
            exit;
        }

        // Devolver los datos del usuario en formato JSON
        echo json_encode([
            'nombre' => $usuario['nombre'],
            'apellido_paterno' => $usuario['apellido_paterno'],
            'apellido_materno' => $usuario['apellido_materno'],
            'telefono' => $usuario['telefono'],
            'correo_institucional' => $usuario['correo_institucional'],
            'carrera' => $usuario['carrera'],
            'img_perfil' => $usuario['img_perfil']
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
}

// Función para subir una imagen de perfil y retornar la ruta donde se guardó
function subirImagenPerfil($imagen)
{
    // Directorio donde se almacenarán las imágenes de perfil
    $directorio_destino = '../../Servidor/Vista/img/perfiles/';
    
    // Obtener información del archivo
    $nombre_archivo = $imagen['name'];
    $tipo_archivo = $imagen['type'];
    $tamano_archivo = $imagen['size'];
    $nombre_temporal = $imagen['tmp_name'];

    // Generar nombre único para el archivo
    $nombre_unico = uniqid('perfil_') . '_' . $nombre_archivo;

    // Mover el archivo temporal al directorio de destino
    if (move_uploaded_file($nombre_temporal, $directorio_destino . $nombre_unico)) {
        // Retornar la ruta completa donde se guardó la imagen
        return $directorio_destino . $nombre_unico;
    } else {
        return false;
    }
}
?>
