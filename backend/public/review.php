<?php

header('Content-Type: application/json');


include __DIR__ . "/../src/helpers/responseHelper.php";
include __DIR__ . '/../src/services/fileService.php';
include __DIR__ . '/../src/services/reviewService.php';
include __DIR__ . "/../config/connection.php";

$UPLOAD_NAME = "userfile";

if($_SERVER['REQUEST_METHOD'] != "POST"){
    respond(false, "Method Not Allowed");
    exit;
}

$content_type = $_SERVER["CONTENT_TYPE"] ?? "";

try {
    if(strpos($content_type, "application/json") !== false) {
        // JSON mode
        $read_str = file_get_contents("php://input");
        if(!$read_str){
            respond(false, "Invalid input.");
            exit;
        }
        
        $input = json_decode($read_str, true);
        if(json_last_error() !== JSON_ERROR_NONE){
            respond(false, "Invalid JSON: " . json_last_error_msg());
            exit;
        }
        
        if(empty($input["code"])){
            respond(false, "Code field is required");
            exit;
        }

        $filename = $input["file"] ?? "input.txt";
        $language = $input["language"] ?? "unknown";
        $code = $input["code"];

    } elseif(strpos($content_type, "multipart/form-data") !== false) {
        // File mode
        if(!isset($_FILES[$UPLOAD_NAME])){
            respond(false, "No file uploaded");
            exit;
        }
        
        $file_info = process_upload($_FILES[$UPLOAD_NAME]);

        if (isset($file_info['error']) && $file_info['error']) {
            respond(false, $file_info['message'] ?? 'File upload failed');
            exit;
        }

        $filename = $file_info["filename"];
        $language = $file_info["language"];
        $code = file_get_contents($file_info["file_path"]);
        
    } else {
        respond(false, "Unsupported content type: $content_type");
        exit;
    }

    if(empty($code)) {
        respond(false, "Code content is empty");
        exit;
    }

    $review_result = review_code($filename, $language, $code);

    respond(true, "success", ["review" => $review_result]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in review.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Return error response
    http_response_code(500);
    respond(false, "Server error: " . $e->getMessage());
}

?>