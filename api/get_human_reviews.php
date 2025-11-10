<?php
// Allow CORS for local development (adjust origin in production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Preflight request
    http_response_code(204);
    exit;
}

    include("./connection.php");

    $sql = "SELECT * FROM security_findings ORDER BY id DESC LIMIT 3";
    $query = $mysql->prepare($sql);
    $query->execute();

    $array = $query->get_result();
    $response = [];
    $response["success"] = true;
    $response["data"] = [];
    while ($article = $array->fetch_assoc()){
        $response["data"][] = $article;
    }
    echo json_encode($response);


?>