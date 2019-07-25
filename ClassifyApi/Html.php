<?php


namespace Econtext\ClassifyApi;


class Html extends AbstractClassify
{
    public static $url = 'https://api.econtext.com/v2/classify/html';

    public function classify($payload, $options = [])
    {
        $parameters = [
            'async' => false,
            'html' => $payload
        ];
        $mergedParams = [
            'json' => array_merge($parameters, $options)
        ];
        return new Result($this->callApi('post', static::$url, $mergedParams));
    }
}