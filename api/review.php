<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

$mockResponse = [
    [
        'severity' => 'high',
        'file' => 'user_service.py',
        'issue' => 'No input validation for user registration',
        'suggestion' => 'Implement proper input validation using a schema validator',
        'line' => 45,
        'rule_id' => 'SEC001',
        'category' => 'security'
    ]
];

echo json_encode($mockResponse);
?>