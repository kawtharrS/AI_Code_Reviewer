<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/curlService.php';

function review_code($filename, $language, $code) {
    global $URL_DEEPSEEK, $API_KEY, $MODEL_VERSION;

    $ai_url = $URL_DEEPSEEK;

    if (empty($ai_url)) {
        throw new Exception("DeepSeek API URL is not configured");
    }

    if (empty($API_KEY)) {
        throw new Exception("DeepSeek API key is not configured");
    }

    $messages = [
        [
            "role" => "system", 
            "content" => "You are a code review expert. Return ONLY valid JSON array matching: [{severity(high|medium|low), file(string), issue(string), suggestion(string), line(optional number), rule_id(optional string), category(security|performance|readability|maintainability|best-practice|bug-risk)}]. No other text."
        ],
        [
            "role" => "user",
            "content" => "Review this {$language} code from {$filename} and return findings as JSON array:\n\n{$code}\n\nRequired fields: severity, file, issue, suggestion. Optional: line, rule_id, category. Return ONLY JSON array."
        ]
    ];

    $headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $API_KEY
    ];

    $payload = [
        'model' => $MODEL_VERSION,
        'messages' => $messages,
        'temperature' => 0.1, 
        'max_tokens' => 4000,
        'response_format' => ['type' => 'json_object'] 
    ];

    try {
        
        $response_raw = call_api('POST', $ai_url, $payload, $headers);
        $response = json_decode($response_raw, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from AI API');
        }

        $content = null;
        if (isset($response['choices'][0]['message']['content'])) {
            $content = $response['choices'][0]['message']['content'];
        } else {
            throw new Exception('Unexpected response format from DeepSeek API');
        }

        if (preg_match('/\[.*\]/s', $content, $matches)) {
            $content = $matches[0];
        } elseif (preg_match('/\{.*\}/s', $content, $matches)) {
            $temp_obj = json_decode($matches[0], true);
            if (isset($temp_obj['findings']) && is_array($temp_obj['findings'])) {
                $content = json_encode($temp_obj['findings']);
            }
        }

        $decoded = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('AI response contained invalid JSON');
        }

        if (!is_array($decoded)) {
            error_log('Decoded content is not an array: ' . print_r($decoded, true));
            $decoded = []; 
        }

        //Normalization takes raw data and clean thim in order to fit 
        global $ALLOWED_SEVERITIES;

        $normalizedList = [];
        foreach ($decoded as $item) {
            if (!is_array($item) && !is_object($item)) continue;
            $it = (array)$item;

            $severity = isset($it['severity']) ? strtolower((string)$it['severity']) : 'low';
            if (!empty($ALLOWED_SEVERITIES) && !in_array($severity, $ALLOWED_SEVERITIES)) {
                $severity = 'low';
            }

            $fileVal = isset($it['file']) ? (string)$it['file'] : $filename;
            $issueVal = isset($it['issue']) ? (string)$it['issue'] : 'Issue not provided';
            $suggestionVal = isset($it['suggestion']) ? (string)$it['suggestion'] : '';

            $normalizedList[] = [
                'severity' => $severity,
                'file' => $fileVal,
                'issue' => $issueVal,
                'suggestion' => $suggestionVal,
            ];
        }

        return $normalizedList;

    } catch (Exception $e) {
        error_log('Error in review_code: ' . $e->getMessage());
        throw $e; 
    }
}
?>