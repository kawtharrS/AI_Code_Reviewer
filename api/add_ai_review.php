<?php

include("./connection.php");

$data = json_decode(file_get_contents("php://input"), true);

$severity = "";
$issue_title = "";
$suggestion = "";
$rule_id = "";
$category = "";
$line_number = "";

if (isset($data["severity"]) && $data["severity"] != "") {
    $severity = $data["severity"]; 
} else {
    $response = [];
    $response["success"] = false;
    $response["error"] = "Severity field is missing";
    echo json_encode($response);
    return;
}

if (isset($data["issue_title"]) && $data["issue_title"] != "") {
    $issue_title = $data["issue_title"]; 
} else {
    $response = [];
    $response["success"] = false;
    $response["error"] = "Issue title field is missing";
    echo json_encode($response);
    return;
}

if (isset($data["suggestion"]) && $data["suggestion"] != "") {
    $suggestion = $data["suggestion"]; // Fixed: use $suggestion, not $name
} else {
    $response = [];
    $response["success"] = false;
    $response["error"] = "Suggestion field is missing";
    echo json_encode($response);
    return;
}

$rule_id = $data["rule_id"] ?? "";
$category = $data["category"] ?? "";
$line_number = $data["line_number"] ?? 0;

try {
    $sql = "INSERT INTO security_findings (severity, issue_title, suggestion, rule_id, category, line_number) VALUES (?,?,?,?,?,?)";
    $query = $mysql->prepare($sql);
    $query->bind_param("sssssi", $severity, $issue_title, $suggestion, $rule_id, $category, $line_number);
    
    if ($query->execute()) {
        $response = [];
        $response["success"] = true;
        echo json_encode($response);
    } else {
        $response = [];
        $response["success"] = false;
        $response["error"] = "Database insert failed";
        echo json_encode($response);
    }
} catch (Exception $e) {
    $response = [];
    $response["success"] = false;
    $response["error"] = "Database error: " . $e->getMessage();
    echo json_encode($response);
}
?>