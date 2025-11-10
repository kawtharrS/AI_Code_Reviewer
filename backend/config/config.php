<?php
$env = parse_ini_file(__DIR__ . "/.env");
$API_KEY = trim($env['OPENAI_KEY'] ?? '');
$URL_OPENAI = "https://api.openai.com/v1/responses";
$STEP_TYPE = "short"; // short | long | persice | helpful etc..
$ALLOWED_SEVERITIES = ["high", "medium", "low"];
$MODEL_VERSION = "gpt-4o-mini";
$ALLOWED_FILE_TYPES = []; //empty = all file types
$MAX_FILE_SIZE = 5 * 1024 * 1024; //size in bytes
$UPLOAD_DIR = dirname(__DIR__) . "/uploads";
$STRICT = true;
$AI_REVIEW_API_URL = "http://localhost:8080/Assignment2/backend/public/review.php"; 
$LOG_DIR = dirname(__DIR__) . "/logs";
?>