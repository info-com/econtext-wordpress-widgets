<?php


namespace Econtext\ClassifyApi;


use GuzzleHttp\Client;

class QuickClassify
{
    protected $client;
    protected $username;
    protected $password;

    public function __construct()
    {
        $this->username = env('ZAPI_USERNAME');
        $this->password = env('ZAPI_PASSWORD');
        $this->client = new Client([
            'auth' => [$this->username, $this->password]
        ]);
    }

    public function social(array $posts)
    {
        $url = "https://api.econtext.com/v2/classify/social";
        $results = $this->client->post($url, [
            'json' => [
                'social' => $posts
            ]
        ]);
        return json_decode($results->getBody()->getContents(), true);
    }
}