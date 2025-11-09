<?php

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