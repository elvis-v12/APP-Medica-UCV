<?php
session_start();
include "../../Cliente/Modelo/conexion.php";

try {
    // Verificar que el usuario esté autenticado
    if (!isset($_SESSION['usuario_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Usuario no autenticado']);
        exit;
    }

    // Configurar localización en español para Perú
    setlocale(LC_TIME, 'es_PE.UTF-8', 'Spanish_Peru', 'Spanish');

    // Si se solicita detalle de una alerta
    if (isset($_GET['id_alerta'])) {
        $id_alerta = $_GET['id_alerta'];

        $sql_detalle = "SELECT a.id_alerta, a.ubicacion, a.piso, a.especificacion, a.descripcion, a.sintomas, a.notas, ha.fecha, ha.estado,
                               u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo_institucional, u.carrera
                        FROM alertas a 
                        INNER JOIN historialalertas ha ON a.id_alerta = ha.id_alerta 
                        INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
                        WHERE a.id_alerta = :id_alerta";
        $stmt_detalle = $db->prepare($sql_detalle);
        $stmt_detalle->bindParam(':id_alerta', $id_alerta, PDO::PARAM_INT);
        $stmt_detalle->execute();

        if ($stmt_detalle->rowCount() > 0) {
            $detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC);
            echo json_encode($detalle);
        } else {
            echo json_encode(['error' => 'No se encontraron detalles para esta alerta.']);
        }
        exit;
    }

    // Si se recibe solicitud de cambio de estado
    if (isset($_POST['id_alerta']) && isset($_POST['nuevo_estado'])) {
        $id_alerta = $_POST['id_alerta'];
        $nuevo_estado = $_POST['nuevo_estado'];

        $sql_update = "UPDATE historialalertas SET estado = :nuevo_estado WHERE id_alerta = :id_alerta";
        $stmt_update = $db->prepare($sql_update);
        $stmt_update->bindParam(':id_alerta', $id_alerta, PDO::PARAM_INT);
        $stmt_update->bindParam(':nuevo_estado', $nuevo_estado, PDO::PARAM_STR);
        $stmt_update->execute();

        if ($stmt_update->rowCount() > 0) {
            echo "Estado actualizado correctamente.";
        } else {
            echo "Error al actualizar el estado.";
        }
        exit;
    }

    // CONSULTA CORREGIDA: mostrar TODAS las alertas pendientes o en proceso (sin filtrar por usuario)
    $sql = "SELECT ha.id_historial, ha.fecha, ha.estado, a.id_alerta, a.ubicacion, a.descripcion,
                   u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo_institucional, u.carrera
            FROM historialalertas ha 
            INNER JOIN alertas a ON ha.id_alerta = a.id_alerta 
            INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
            WHERE ha.estado IN ('Pendiente', 'En proceso')
            ORDER BY ha.fecha DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $ultimaFecha = null;
        echo "<div class='table-responsive'>";

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $fechaFormateada = ucfirst(strftime("%A, %d de %B de %Y", strtotime($row["fecha"])));
            $fechaFormateada = mb_convert_encoding($fechaFormateada, 'UTF-8', 'HTML-ENTITIES');
            $horaFormateada = date("H:i", strtotime($row["fecha"]));
            $primerNombre = explode(' ', trim($row['nombre']))[0];
            $estadoClase = getEstadoColor($row["estado"]);

            if ($fechaFormateada != $ultimaFecha) {
                if ($ultimaFecha !== null) {
                    echo "</tbody></table>";
                }
                $ultimaFecha = $fechaFormateada;
                echo "<h3 class='mt-4'>" . $fechaFormateada . "</h3>";
                echo "<table class='table table-striped'>";
                echo "<thead><tr><th>Hora</th><th>Código</th><th>Nombres</th><th>Apellidos</th><th>Correo</th><th>Estado</th><th>Acciones</th></tr></thead>";
                echo "<tbody>";
            }

            echo "<tr>";
            echo "<td>" . htmlspecialchars($horaFormateada) . "</td>";
            echo "<td>" . htmlspecialchars($row["id_usuario"]) . "</td>";
            echo "<td>" . htmlspecialchars($primerNombre) . "</td>";
            echo "<td>" . htmlspecialchars($row["apellido_paterno"]) . " " . htmlspecialchars($row["apellido_materno"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["correo_institucional"]) . "</td>";
            echo "<td><span style='pointer-events: none;' class='btn " . $estadoClase . "'>" . htmlspecialchars($row["estado"]) . "</span></td>";
            echo "<td>";
            echo "<button class='btn btn-info btn-sm ver-alerta' data-id-alerta='" . $row['id_alerta'] . "'>Ver</button> ";
            echo "<button class='btn btn-primary btn-sm editar-alerta' data-id-alerta='" . $row['id_alerta'] . "' data-estado='" . $row['estado'] . "'>Editar Estado</button>";
            echo "</td>";
            echo "</tr>";
        }

        echo "</tbody></table></div>";
    } else {
        echo "<p class='text-center'>No hay alertas médicas registradas con estado Pendiente o En proceso.</p>";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

function getEstadoColor($estado) {
    switch ($estado) {
        case 'Pendiente': return 'btn-danger btn-sm';
        case 'En proceso': return 'btn-warning btn-sm';
        case 'Atendido': return 'btn-success btn-sm';
        case 'Cancelado': return 'btn-secondary btn-sm';
        default: return 'btn-secondary btn-sm';
    }
}

$db = null;
?>
