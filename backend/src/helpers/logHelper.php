<?php
include("config/settings.php");

if (!file_exists($LOG_DIR)){
    mkdir($LOG_DIR, 0755, true);
}
$LOG_FILE = "$LOG_DIR/errors.log";
?>