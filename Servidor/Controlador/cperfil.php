<?php
session_start();
include "../../Cliente/Modelo/conexion.php";

try {
    if (!isset($_SESSION['usuario_id'])) {
        echo json_encode(['error' => 'Usuario no autenticado']);
        exit;
    }

    $id_usuario = $_SESSION['usuario_id'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $nombre = $_POST['nombre'];
        $apellido_paterno = $_POST['apellido_paterno'];
        $apellido_materno = $_POST['apellido_materno'];
        $telefono = $_POST['telefono'];
        $carrera = $_POST['carrera'];

        // ✅ Si no se actualiza imagen, conservar la anterior
        $img_perfil = null;
        if (isset($_FILES['fotoPerfil']) && $_FILES['fotoPerfil']['error'] === UPLOAD_ERR_OK) {
            $img_perfil = subirImagenPerfil($_FILES['fotoPerfil']);
            if (!$img_perfil) {
                echo json_encode(['error' => 'Error al subir la imagen de perfil']);
                exit;
            }
        } else {
            // Obtener imagen actual si no se actualiza
            $stmt_img = $db->prepare("SELECT img_perfil FROM usuarios WHERE id_usuario = :id_usuario");
            $stmt_img->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt_img->execute();
            $img_perfil = $stmt_img->fetchColumn();
        }

        if (isset($_POST['clave']) && isset($_POST['confirmar_clave'])) {
            $clave = $_POST['clave'];
            $confirmar_clave = $_POST['confirmar_clave'];

            if ($clave !== $confirmar_clave) {
                echo json_encode(['error' => 'La contraseña y la confirmación no coinciden']);
                exit;
            }

            $sql = "SELECT clave FROM usuarios WHERE id_usuario = :id_usuario";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt->execute();
            $hash_clave_bd = $stmt->fetchColumn();

            if (!password_verify($clave, $hash_clave_bd)) {
                echo json_encode(['error' => 'La contraseña actual no es válida']);
                exit;
            }
        }

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
            echo json_encode(['success' => 'Perfil actualizado correctamente']);
        } else {
            echo json_encode(['error' => 'Error al actualizar el perfil']);
        }
        exit;
    } else {
        $sql = "SELECT nombre, apellido_paterno, apellido_materno, telefono, correo_institucional, carrera, img_perfil 
                FROM usuarios 
                WHERE id_usuario = :id_usuario";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(['error' => 'Usuario no encontrado']);
            exit;
        }

        echo json_encode($usuario);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
}

function subirImagenPerfil($imagen) {
    $directorio_destino = '../../Servidor/Vista/img/perfiles/';
    if (!file_exists($directorio_destino)) {
        mkdir($directorio_destino, 0777, true);
    }

    $nombre_archivo = $imagen['name'];
    $nombre_temporal = $imagen['tmp_name'];
    $nombre_unico = uniqid('perfil_') . '_' . basename($nombre_archivo);

    $ruta_completa = $directorio_destino . $nombre_unico;

    if (move_uploaded_file($nombre_temporal, $ruta_completa)) {
        return $ruta_completa;
    } else {
        return false;
    }
}
