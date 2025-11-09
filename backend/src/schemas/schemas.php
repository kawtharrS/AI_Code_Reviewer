<?php
include __DIR__ . "/../../config/config.php";

$SCHEMA = ["type" => "array"];
$SCHEMA["items"] = [
    "type" => "object",
    "properties" => [
        "severity" => ["type" => "string", "enum" => $ALLOWED_SEVERITIES],
        "file" => ["type" => "string", "description" => "file name where the issue was found, it can also be 'string' if code was given as a string"],
        "issue" => ["type" => "string", "description" => "Description of the code issue if found", "minLength" => 1],
        "suggestion" => ["type" => "string", "description" => "Specific suggestion to fix the issue found", "minLength" => 1],
        "line" => ["type" => ["integer", "null"], "minimum" => 1, "description" => "Optional, line number where the issue was found"],
        "rule_id" => ["type" => ["string", "null"], "description" => "Optional unique identifier for the rule violated"],
        "category" => ["type" => ["string", "null"], "enum" => ["security", "performance", "best-practice", "maintainability", "readability", "bug-risk"]]
    ],
    "required" => ["severity", "file", "issue", "suggestion"],
    "additionalProperties" => false
];
$SCHEMA["minItems"] = 0;

?>