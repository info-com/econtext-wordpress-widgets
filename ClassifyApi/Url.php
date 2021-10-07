<?php

namespace Econtext\ClassifyApi;

class Url extends AbstractClassify
{
    public static $url = 'https://api.econtext.com/v2/classify/url';

    public function classify($url, $options = [])
    {
        $parameters = [
            'async' => false,
            'url' => $url
        ];
        $mergedParams = [
            'json' => array_merge($parameters, $options)
        ];
        return new Result($this->callApi('post', static::$url, $mergedParams));
    }
}