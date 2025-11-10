<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/curlService.php';

function review_code($filename, $language, $code) {
    global $URL_OPENAI, $API_KEY, $MODEL_VERSION;

    $ai_url = $URL_OPENAI ?? ($AI_REVIEW_API_URL ?? null);


    $prompt = "
    You are an expert senior developer performing a strict code review.

    Analyze the following code.

    File: {$filename}
    Language: {$language}

    Code:
    \"\"\"
    {$code}
    \"\"\"

    Return ONLY valid JSON as an array of findings.
    Each finding must contain:
    - severity (high | medium | low)
    - file (string)
    - issue (short description of the problem)
    - suggestion (specific remediation steps)
    Optional fields:
    - line (number)
    - rule_id (string)
    - category (e.g. security, performance, maintainability)

    Example JSON output:
    [
    {
        \"severity\": \"high\",
        \"file\": \"user2.py\",
        \"issue\": \"No input validation for user registration\",
        \"suggestion\": \"Implement proper input validation using a schema validator\",
        \"line\": 45,
        \"rule_id\": \"SEC001\",
        \"category\": \"security\"
    }
    ]

    DO NOT include explanations, markdown, or text outside the JSON array.
    ";

    $headers = [
        'Content-Type: application/json'
    ];
    if (!empty($API_KEY)) {
        $headers[] = 'Authorization: Bearer ' . $API_KEY;
    }

    $payload = [
        'model' => $MODEL_VERSION ?? 'gpt-4o',
        'input' => $prompt
    ];

    //call openai
    try {
        $response_raw = call_api('POST', $ai_url, $payload, $headers);

        $response = json_decode($response_raw, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('AI response JSON decode error: ' . json_last_error_msg());
        }

        $content = null;
        if (isset($response['choices'][0]['message']['content'])) {
            $content = $response['choices'][0]['message']['content'];
        } elseif (isset($response['output']) && is_array($response['output'])) {
            foreach ($response['output'] as $out) {
                if (isset($out['content']) && is_array($out['content'])) {
                    foreach ($out['content'] as $c) {
                        if (isset($c['type']) && ($c['type'] === 'output_text' || $c['type'] === 'message')) {
                            $content = $c['text'] ?? ($c['content'] ?? null);
                            break 2;
                        }
                        if (isset($c['text'])) {
                            $content = $c['text'];
                            break 2;
                        }
                    }
                }
            }
        }

        if ($content === null) {
            error_log('AI response did not contain expected text content: ' . print_r($response, true));
        }

        if (preg_match('/\[.*\]/s', $content, $matches)) {
            $content = $matches[0];
        }

        $decoded = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Decoded content is not valid JSON: ' . json_last_error_msg());
        }

        if (!is_array($decoded)) {
        }

        global $ALLOWED_SEVERITIES;
        $allowedCategories = [
            'security','performance','best-practice','maintainability','readability','bug-risk'
        ];

        $categoryMap = [
            'correctness' => 'bug-risk',
            'style' => 'readability',
            'maintainability' => 'maintainability',
            'security' => 'security',
            'performance' => 'performance',
            'best-practice' => 'best-practice',
            'readability' => 'readability',
            'bug-risk' => 'bug-risk'
        ];

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

            $lineVal = null;
            if (isset($it['line']) && is_numeric($it['line'])) {
                $lineVal = (int)$it['line'];
                if ($lineVal < 1) $lineVal = null;
            }

            $ruleVal = isset($it['rule_id']) ? (string)$it['rule_id'] : null;

            $catRaw = isset($it['category']) ? strtolower((string)$it['category']) : null;
            $catVal = null;
            if ($catRaw) {
                if (isset($categoryMap[$catRaw])) {
                    $catVal = $categoryMap[$catRaw];
                } elseif (in_array($catRaw, $allowedCategories)) {
                    $catVal = $catRaw;
                }
            }

            $normalizedList[] = [
                'severity' => $severity,
                'file' => $fileVal,
                'issue' => $issueVal,
                'suggestion' => $suggestionVal,
                'line' => $lineVal,
                'rule_id' => $ruleVal,
                'category' => $catVal
            ];
        }

        return $normalizedList;

    } catch (Exception $e) {
        error_log('Error in review_code: ' . $e->getMessage());
    }
}


?>