<?php
include __DIR__ . "/../schemas/schemas.php";
include __DIR__ . "/curlService.php";
include __DIR__ . "/../../config/config.php";
include __DIR__ . "/../helpers/logHelper.php";

function review_code($filename, $language, $code){
    global $MODEL_VERSION, $API_KEY, $SCHEMA, $STRICT, $STEP_TYPE, $URL_OPENAI, $LOG_FILE;
    $header = array("Content-Type: application/json", "Authorization: Bearer {$API_KEY}");
    $instructions = "talk like a senior developer who is review/criticizing the code. Don't give vague general problem description and let the suggestions be {$STEP_TYPE} concrete remediation steps";
    $user_input = sprintf(
        "file = %s, language = %s, code = %s",
        json_encode($filename),
        json_encode($language),
        json_encode($code)
    );
    $model_prompt = [
        "model" => $MODEL_VERSION,
        "reasoning" => ["effort" => "low"],
        "input" => [
            ["role" => "developer", "content" => $instructions],
            ["role" => "user", "content" => $user_input]
        ],
        "text" => [
            "format" => [
                "type" => "json_schema",
                "name" => "code_review",
                "schema" => $SCHEMA,
                "strict" => $STRICT
            ]
        ]
    ];
    //call openai
    try{
        $response = call_api("post", $URL_OPENAI, $header, $model_prompt);
        if(!$response){
            error_log("null: " . print_r($response, true) . "\n", 3, $LOG_FILE);
            throw new Exception("Check the api version mate!");
        }
        if(isset($response["status"]) && $response["status"] != "completed"){
            error_log("failed response: " . json_encode($response) . "\n", 3, $LOG_FILE);
            throw new Exception("Failed response from open ai");
        }
        if(isset($response["output"]) && !empty($response["output"])){
            foreach($response["output"] as $obj){
                if($obj["type"] == "message" && $obj["role"] == "assistant"){
                    if($obj["status"] == "completed"){
                        return $obj["content"][0]["text"];
                    } else {
                        error_log("Incomplete review: " . json_encode($response) . "\n", 3, $LOG_FILE);
                        throw new Exception("Incomplete review!");
                    }
                }
            }
        }
        error_log("No output: " . json_encode($response) . "\n", 3, $LOG_FILE);
        throw new Exception("No output was found in the agent response.");
    } catch (Exception $e){
        throw $e;
    }
}
?>