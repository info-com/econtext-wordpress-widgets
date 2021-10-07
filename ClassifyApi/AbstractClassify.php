<?php


namespace Econtext\ClassifyApi;

use GuzzleHttp\Client;

abstract class AbstractClassify
{
    /**
     * @var $guzzle Client
     */
    protected $guzzle;

    public function __construct($username, $password)
    {
        $this->guzzle = new Client([
            'auth' => [$username, $password],
            'verify' => false
        ]);
    }

    public function callApi($method, $url, array $options = [])
    {
        try {
            $options['verify'] = false;
            $request = $this->guzzle->request($method, $url, $options);
            return $request;
        } catch (\Exception $e) {
            if (env('APP_DEBUG', false) == 'true') {
                dd($e->getMessage());
            }
            return false;
        }
    }

    abstract public function classify($payload, $options = []);
}