<?php


namespace Econtext\ClassifyApi;


class Social extends AbstractClassify
{
    public static $url = 'https://api.econtext.com/v2/classify/social';

    public function classify($payload, $options = [])
    {
        if (!is_array($payload)) {
            $payload = [$payload];
        }
        $parameters = [
            'async' => false,
            'entities' => false,
            'flags' => false,
            'sentiment' => false,
            'social' => $payload
        ];
        $mergedParams = [
            'json' => array_merge($parameters, $options)
        ];
        return new Result($this->callApi('post', static::$url, $mergedParams));
    }
}