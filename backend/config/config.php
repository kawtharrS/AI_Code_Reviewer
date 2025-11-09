<?php
$_key_file = __DIR__ . "/key.txt";
$API_KEY = file_get_contents($_key_file);
$URL_OPENAI = "https://api.openai.com/v1/responses";
$STEP_TYPE = "short"; // short | long | persice | helpful etc..
$ALLOWED_SEVERITIES = ["high", "medium", "low"];
$MODEL_VERSION = "gpt-5-mini-2025-08-07";
$ALLOWED_FILE_TYPES = []; //empty = all file types
$MAX_FILE_SIZE = 5 * 1024 * 1024; //size in bytes
$UPLOAD_DIR = dirname(__DIR__) . "/uploads";
$STRICT = true;
$LOG_DIR = dirname(__DIR__) . "/logs";
?>