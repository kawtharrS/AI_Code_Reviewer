<?php
include __DIR__ . "/../../config/config.php";

function process_upload(array $file){
    global $MAX_FILE_SIZE, $UPLOAD_DIR, $ALLOWED_FILE_TYPES;

    if($file["error"] === UPLOAD_ERR_OK){
        throw new Exception("File upload error {$file['error']}");
    }

    if($file["size"] > $MAX_FILE_SIZE){
        $file_info["error"] = 1;
        return $file_info;
    }

    $file_ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    
    if(!empty($ALLOWED_FILE_TYPES) && !in_array($file_ext, $ALLOWED_FILE_TYPES)){
        throw new Exception("File Type is not allowed {$file_ext}");
    }

    if(!file_exists($UPLOAD_DIR)){
        mkdir($UPLOAD_DIR, 0755, true);
    }
    $safe_name = uniqid("{$file['name']}_", false) . "." . $file_ext;
    $destination = $UPLOAD_DIR . "/" . $safe_name;

    if(!move_uploaded_file($file["temp_name"], $destination)){
        throw new Exception("Failed to move uploaded file");
    }
    
    return [
        "filename" => $file["name"],
        "file_path" => $destination,
        "language" => $file_ext,
    ];
}

?>