<?php


namespace Econtext\ClassifyApi;


class Text extends AbstractClassify
{
    public static $url = 'https://api.econtext.com/v2/classify/text';

    public function classify($payload, $options = [])
    {
        $parameters = [
            'async' => false,
            'entities' => false,
            'sentiment' => true,
            'text' => $payload
        ];
        $mergedParams = [
            'json' => array_merge($parameters, $options)
        ];
        return new Result($this->callApi('post', static::$url, $mergedParams));
    }
}