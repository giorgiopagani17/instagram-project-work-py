<?php
//Connessione al db
require_once 'connessione_db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Check & Get InputDati
        if (isset($_GET['user_id'])) {
            $user_id = $_GET['user_id'];

            //Check se user esiste
            $query_check_user = "SELECT id FROM users WHERE id = :user_id";
            $stmt_check_user = $connection->prepare($query_check_user);
            $stmt_check_user->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt_check_user->execute();
            $user_exists = $stmt_check_user->fetch();

            if ($user_exists) {
                //Get path img
                $query = "SELECT img FROM users WHERE id = :user_id";
                $statement = $connection->prepare($query);
                $statement->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $statement->execute();
                $user_image_path = $statement->fetchColumn();

                if ($user_image_path) {
                    //Restituisci in output l'img jpg
                    $image_content = file_get_contents($user_image_path);
                    header('Content-Type: image/jpeg');
                    echo $image_content;
                    exit();
                } else {
                    http_response_code(404);
                    echo json_encode(["detail" => "Immagine non trovata per l'utente con ID $user_id"]);
                    exit();
                }
            } else {
                http_response_code(404);
                echo json_encode(["detail" => "Utente non trovato con ID $user_id"]);
                exit();
            }
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["detail" => "Errore" . $e->getMessage()]);
    exit();
}
?>
