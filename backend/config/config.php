<?php
$env = parse_ini_file(__DIR__ . "/.env");
$API_KEY = $env['DEEPSEEK_KEY'] ?? ''; 
$URL_DEEPSEEK = "https://api.deepseek.com/v1/chat/completions"; 
$STEP_TYPE = "short";
$ALLOWED_SEVERITIES = ["high", "medium", "low"];
$MODEL_VERSION = "deepseek-chat"; 
$ALLOWED_FILE_TYPES = [];
$MAX_FILE_SIZE = 5 * 1024 * 1024;
$UPLOAD_DIR = dirname(__DIR__) . "/uploads";
$STRICT = true;
$AI_REVIEW_API_URL = "http://localhost:8080/Assignment2/backend/public/review.php"; 
$LOG_DIR = dirname(__DIR__) . "/logs";
?>