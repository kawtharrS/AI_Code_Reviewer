<?php
include __DIR__ . "/../src/helpers/responseHelper.php";
include __DIR__ . '/../src/services/fileService.php';
include __DIR__ . '/../src/services/reviewService.php';

$UPLOAD_NAME = "userfile";

if($_SERVER['REQUEST_METHOD'] != "POST"){
    respond(false, "Method Not Allowed");
}

$content_type = $_SERVER["CONTENT_TYPE"] ?? "";

try{
    if(strpos($content_type, "application/json") !== false){
        //json mode
        $read_str = file_get_contents("php://input");
        if(!$read_str){
            respond(false, "Invalid input.");
        }
        $input = json_decode($read_str, true);
        if(!$input && empty($input["code"])){
            respond(false, "Invalid JSON object");
        }

        $filename = $input["file"] ?? "not given";
        $language = $input["language"] ?? "not given";
        $code = $input["code"];

    } elseif(strpos($content_type, "multipart/form-data")){
        //file mode
        if(!isset($_FILES[$UPLOAD_NAME])){
            respond(false, "No file uploaded");
        }
        
        $file_info = process_upload($_FILES[$UPLOAD_NAME]);

        $filename = $file_info["filename"];
        $language = $file_info["language"];
        $code = file_get_contents($file_info["file_path"]);
    } else {
        respond(false, "Unsupported content type: $content_type");
    }

    //call the review service here
    $review_result = review_code($filename, $language, $code);

    respond(true, "success",  ["review" => [$review_result]]);

} catch (Exception $e){
    respond(false, "Server error: " . $e->getMessage());
}

?>