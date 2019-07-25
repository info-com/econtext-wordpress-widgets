<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 3:36 PM
 */

namespace Econtext\Controller;

use Econtext\ClassifyApi\Social;
use Econtext\Classify\JsonOutput;
use Econtext\ClassifyApi\Text;
use GuzzleHttp\Client;
use Econtext\Utilities\YouTubeCaptions;

class VideoController extends InternalApiController
{
    protected $usageName = 'usage_video';

    public function connect()
    {
        $url = $this->input('query', 'null');
        if (!$url) {
            return $this->sendError('You must include a YouTube url as the query.');
        }
        if (! preg_match('/^https?\:\/\//', $url)) {
            $url = 'http://'.$url;
        }
        $transientId = md5('video'.$url);
        if (false === ($results = get_transient($transientId))) {
            //$this->validateUsage();
            try {
                $yt = new YouTubeCaptions($url);
                $classify = new Text(env('ZAPI_USERNAME'), env('ZAPI_PASSWORD'));
                $results = $classify->classify(implode("\n", $yt->getCaptions()));
            } catch (\Exception $e) {
                return $this->sendError($e->getMessage());
            }
            $this->logUsage();
            set_transient($transientId, $results, 60 * 60 * 24);
        }
        $output = JsonOutput::create($url, $results->getAggregatedCategories(false, 'score', 'desc'));
        return $this->sendJSON($output);
    }

    public function getHtml($url)
    {
        $headers = [
            'Connection' => $_SERVER["HTTP_CONNECTION"],
            'Pragma' => $_SERVER["HTTP_PRAGMA"],
            'Cache-Control' => $_SERVER["HTTP_CACHE_CONTROL"],
            'Accept' => $_SERVER["HTTP_ACCEPT"],
            'User-Agent' => $_SERVER["HTTP_USER_AGENT"],
            'Accept-Encoding' => $_SERVER["HTTP_ACCEPT_ENCODING"],
            'Accept-Language' => $_SERVER["HTTP_ACCEPT_LANGUAGE"]
        ];
        $client = new Client();
        $res = $client->get($url, [
            'headers' => $headers
        ]);
        return strval($res->getBody());
    }
}