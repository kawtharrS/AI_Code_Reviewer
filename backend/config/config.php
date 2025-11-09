<?php
$_key_file = "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";
$API_KEY = "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";
$URL_OPENAI = "https://api.openai.com/v1/responses";
$STEP_TYPE = "short"; // short | long | persice | helpful etc..
$ALLOWED_SEVERITIES = ["high", "medium", "low"];
$MODEL_VERSION = "gpt-5-mini-2025-08-07";
$ALLOWED_FILE_TYPES = []; //empty = all file types
$MAX_FILE_SIZE = 5 * 1024 * 1024; //size in bytes
$UPLOAD_DIR = dirname(__DIR__) . "/uploads";
$STRICT = true;
$AI_REVIEW_API_URL = "http://localhost:8080/Assignment2/backend/public/review.php"; 
$LOG_DIR = dirname(__DIR__) . "/logs";
?>