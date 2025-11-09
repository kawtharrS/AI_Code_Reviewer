<?php

function call_api(string $method, string $url, array $header = [], array $data = []): mixed {
    $curl = curl_init();

    switch (strtoupper($method)){
        case "POST":
            curl_setopt($curl, CURLOPT_POST, 1);
            if($data){
                if(array_filter($header, fn($h) => strpos($h, "application/json") !== false)){
                    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
                }else{
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                }
            }
            break;
        default:
            if($data){
                $url = sprintf("%s?%s", $url, http_build_query($data));
            }
    }
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($curl, CURLOPT_TIMEOUT, 30);

    $result = curl_exec($curl);
    if(!$result){
        $error = curl_error($curl);
        curl_close($curl);
        throw new Exception("curl error: $error");
    }

    curl_close($curl);
    return json_decode($result, true);
}
?>