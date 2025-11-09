<?php

function call_api(string $method, string $url, array $data = [], array $headers = []) {
    if (empty($url)) {
        throw new Exception("API URL cannot be empty");
    }
    
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        throw new Exception("Invalid API URL: " . $url);
    }
    
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if (strtoupper($method) === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif (strtoupper($method) === 'GET') {
        if (!empty($data)) {
            $url .= '?' . http_build_query($data);
            curl_setopt($ch, CURLOPT_URL, $url);
        }
    }
    
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($response === false) {
        throw new Exception("cURL error: " . $error);
    }
    
    if ($http_code >= 400) {
        throw new Exception("HTTP error {$http_code}: " . substr($response, 0, 200));
    }
    
    return $response;
}

?>