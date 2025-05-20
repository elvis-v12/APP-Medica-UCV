<?php
session_start();
include "../../Cliente/Modelo/conexion.php";

try {
    // Obtener el ID del usuario de la sesión
    if (!isset($_SESSION['usuario_id'])) {
        echo "Usuario no autenticado";
        exit;
    }
    $id_usuario = $_SESSION['usuario_id'];

    // Configurar la localización en español para Perú
    setlocale(LC_TIME, 'es_PE.UTF-8', 'Spanish_Peru', 'Spanish');

    // Verificar si se envía la acción 'ver' y el ID del usuario
    if (isset($_GET['action']) && $_GET['action'] === 'ver' && isset($_GET['id_usuario'])) {
        $id_usuario_ver = $_GET['id_usuario'];

        // Consulta SQL para obtener los detalles del usuario específico
        $sql_detalle = "SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo_institucional, r.nombre AS rol_nombre, 
                               ta.nombre AS tipo_acceso, ec.fecha_hora
                        FROM usuarios u
                        INNER JOIN roles r ON u.id_rol = r.id_rol
                        LEFT JOIN registroacceso ec ON u.id_usuario = ec.id_usuario
                        LEFT JOIN tipoacceso ta ON ec.id_tipo = ta.id_tipo
                        WHERE u.id_usuario = :id_usuario_ver";
        $stmt_detalle = $db->prepare($sql_detalle);
        $stmt_detalle->bindParam(':id_usuario_ver', $id_usuario_ver, PDO::PARAM_INT);
        $stmt_detalle->execute();

        // Comprobar si se encontró el registro
        if ($stmt_detalle->rowCount() > 0) {
            // Obtener los detalles del usuario
            $detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC);

            // Formatear la fecha y la hora
            $fechaFormateada = ucfirst(strftime("%A, %d de %B de %Y", strtotime($detalle["fecha_hora"])));
            $fechaFormateada = mb_convert_encoding($fechaFormateada, 'UTF-8', 'HTML-ENTITIES');
            $horaFormateada = date("H:i", strtotime($detalle["fecha_hora"]));

            // Generar el HTML con los detalles del usuario
            echo "<p><strong>ID de Usuario:</strong> " . htmlspecialchars($detalle['id_usuario']) . "</p>";
            echo "<p><strong>Nombre:</strong> " . htmlspecialchars($detalle['nombre']) . " " . htmlspecialchars($detalle['apellido_paterno']) . " " . htmlspecialchars($detalle['apellido_materno']) . "</p>";
            echo "<p><strong>Correo Institucional:</strong> " . htmlspecialchars($detalle['correo_institucional']) . "</p>";
            echo "<p><strong>Rol:</strong> " . htmlspecialchars($detalle['rol_nombre']) . "</p>";
            echo "<p><strong>Tipo de Acceso:</strong> " . htmlspecialchars($detalle['tipo_acceso']) . "</p>";
            echo "<p><strong>Fecha de acceso:</strong> " . htmlspecialchars($fechaFormateada) . " a las " . htmlspecialchars($horaFormateada) . "</p>";
        } else {
            echo "<p>No se encontraron detalles para este usuario.</p>";
        }
        exit; // Salir para no continuar con el resto del código
    }

    // Verificar si se envía la acción 'editar' y el ID del usuario
    if (isset($_GET['action']) && $_GET['action'] === 'editar' && isset($_GET['id_usuario'])) {
        $id_usuario_editar = $_GET['id_usuario'];

        // Consulta SQL para obtener los detalles del usuario específico para editar
        $sql_editar = "SELECT id_usuario, nombre, apellido_paterno, apellido_materno, correo_institucional, id_rol
                       FROM usuarios
                       WHERE id_usuario = :id_usuario_editar";
        $stmt_editar = $db->prepare($sql_editar);
        $stmt_editar->bindParam(':id_usuario_editar', $id_usuario_editar, PDO::PARAM_INT);
        $stmt_editar->execute();

        // Comprobar si se encontró el registro
        if ($stmt_editar->rowCount() > 0) {
            // Obtener los detalles del usuario para editar
            $detalle = $stmt_editar->fetch(PDO::FETCH_ASSOC);

            // Generar el formulario HTML para editar el usuario
            echo "<form id='formEditarUsuario'>";
            echo "<input type='hidden' name='id_usuario' value='" . htmlspecialchars($detalle['id_usuario']) . "'>";
            echo "<div class='mb-3'>";
            echo "<label for='nombre' class='form-label'>Nombre</label>";
            echo "<input type='text' class='form-control' id='nombre' name='nombre' value='" . htmlspecialchars($detalle['nombre']) . "' required>";
            echo "</div>";
            echo "<div class='mb-3'>";
            echo "<label for='apellido_paterno' class='form-label'>Apellido Paterno</label>";
            echo "<input type='text' class='form-control' id='apellido_paterno' name='apellido_paterno' value='" . htmlspecialchars($detalle['apellido_paterno']) . "' required>";
            echo "</div>";
            echo "<div class='mb-3'>";
            echo "<label for='apellido_materno' class='form-label'>Apellido Materno</label>";
            echo "<input type='text' class='form-control' id='apellido_materno' name='apellido_materno' value='" . htmlspecialchars($detalle['apellido_materno']) . "'>";
            echo "</div>";
            echo "<div class='mb-3'>";
            echo "<label for='correo_institucional' class='form-label'>Correo Institucional</label>";
            echo "<input type='email' class='form-control' id='correo_institucional' name='correo_institucional' value='" . htmlspecialchars($detalle['correo_institucional']) . "' required>";
            echo "</div>";
            echo "<div class='mb-3'>";
            echo "<label for='id_rol' class='form-label'>Rol</label>";
            echo "<select class='form-select' id='id_rol' name='id_rol' required>";
            
            // Consulta SQL para obtener los roles disponibles
            $sql_roles = "SELECT id_rol, nombre FROM roles";
            $stmt_roles = $db->prepare($sql_roles);
            $stmt_roles->execute();
            while ($rol = $stmt_roles->fetch(PDO::FETCH_ASSOC)) {
                echo "<option value='" . htmlspecialchars($rol['id_rol']) . "' " . ($detalle['id_rol'] == $rol['id_rol'] ? 'selected' : '') . ">" . htmlspecialchars($rol['nombre']) . "</option>";
            }
            echo "</select>";
            echo "</div>";
            echo "<button type='submit' class='btn btn-primary'>Guardar cambios</button>";
            echo "<button style='margin-left:10px;' type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button>";
            echo "</form>";
        } else {
            echo "<p>No se encontraron detalles para este usuario.</p>";
        }
        exit; // Salir para no continuar con el resto del código
    }

    // Función para guardar cambios usando JavaScript y AJAX
    if (isset($_POST['id_usuario'])) {
        $id_usuario = $_POST['id_usuario'];
        $nombre = $_POST['nombre'];
        $apellido_paterno = $_POST['apellido_paterno'];
        $apellido_materno = $_POST['apellido_materno'];
        $correo_institucional = $_POST['correo_institucional'];
        $id_rol = $_POST['id_rol'];

        // Consulta SQL para actualizar los datos del usuario
        $sql_actualizar = "UPDATE usuarios
                           SET nombre = :nombre, apellido_paterno = :apellido_paterno, apellido_materno = :apellido_materno, 
                               correo_institucional = :correo_institucional, id_rol = :id_rol
                           WHERE id_usuario = :id_usuario";
        $stmt_actualizar = $db->prepare($sql_actualizar);
        $stmt_actualizar->bindParam(':nombre', $nombre, PDO::PARAM_STR);
        $stmt_actualizar->bindParam(':apellido_paterno', $apellido_paterno, PDO::PARAM_STR);
        $stmt_actualizar->bindParam(':apellido_materno', $apellido_materno, PDO::PARAM_STR);
        $stmt_actualizar->bindParam(':correo_institucional', $correo_institucional, PDO::PARAM_STR);
        $stmt_actualizar->bindParam(':id_rol', $id_rol, PDO::PARAM_INT);
        $stmt_actualizar->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);

        // Ejecutar la consulta
        if ($stmt_actualizar->execute()) {
            echo "Actualización exitosa";
        } else {
            echo "Error al actualizar";
        }
        exit; // Salir para no continuar con el resto del código
    }

    // Consulta SQL para obtener todos los usuarios con su estado de cuenta y nombre del tipo de acceso
    $sql = "SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo_institucional, r.nombre AS rol_nombre, 
                   ta.nombre AS tipo_acceso
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN registroacceso ec ON u.id_usuario = ec.id_usuario
            LEFT JOIN tipoacceso ta ON ec.id_tipo = ta.id_tipo
            ORDER BY u.id_usuario";

    // Preparar la consulta
    $stmt = $db->prepare($sql);

    // Ejecutar la consulta
    $stmt->execute();

    // Comprobar si se encontraron usuarios
    if ($stmt->rowCount() > 0) {
        // Iniciar la tabla
        echo "<table class='table table-striped'>";
        echo "<thead>";
        echo "<tr>";
        echo "<th>ID</th>";
        echo "<th>Nombres</th>";
        echo "<th>Apellidos</th>";
        echo "<th>Correo</th>";
        echo "<th>Rol</th>";
        echo "<th>Estado</th>";
        echo "<th>Acciones</th>"; // Columna para acciones
        echo "</tr>";
        echo "</thead>";
        echo "<tbody>";

        // Iterar sobre los resultados y mostrar cada usuario como una fila de la tabla
        while ($usuario = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($usuario['id_usuario']) . "</td>";
            echo "<td>" . htmlspecialchars($usuario['nombre']) . "</td>";
            echo "<td>" . htmlspecialchars($usuario['apellido_paterno']) . " " . htmlspecialchars($usuario['apellido_materno']) . "</td>";
            echo "<td>" . htmlspecialchars($usuario['correo_institucional']) . "</td>";
            echo "<td>" . htmlspecialchars($usuario['rol_nombre']) . "</td>";
            echo "<td>" . htmlspecialchars($usuario['tipo_acceso']) . "</td>";
            echo "<td>";
            // Botón Ver que llama a la función verUsuario() en JavaScript
            echo "<button class='btn btn-info btn-sm ver-usuario' data-id='" . $usuario['id_usuario'] . "'>Ver</button> ";
            // Botón Editar que llama a la función editarUsuario() en JavaScript
            echo "<button class='btn btn-warning btn-sm editar-usuario' data-id='" . $usuario['id_usuario'] . "'>Editar</button>";
            echo "</td>";
            echo "</tr>";
        }

        // Cerrar la tabla
        echo "</tbody>";
        echo "</table>";
    } else {
        echo "<p class='text-center'>No hay usuarios registrados.</p>";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

// Cerrar la conexión
$db = null;
?>
