<?php
function respond(bool $status, string $message, array $data = []){
    echo json_encode(array_merge(["status" => $status, "message" => $message], $data));
    exit;
}

?>