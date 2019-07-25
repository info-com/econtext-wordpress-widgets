<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/15/16
 * Time: 2:19 PM
 */

namespace Econtext\Controller;

use Econtext\ClassifyApi\Social;
use Econtext\Classify\JsonOutput;

class SearchController extends InternalApiController
{
    protected $twitter;
    protected $usageName = 'usage_search';

    public function __construct($app, $request)
    {
        parent::__construct($app, $request);
        $this->twitter = $this->app->make('twitter');
    }

    public function connect()
    {
	    $transientId = md5($this->input('q'));
	    if (false === ($results = get_transient($transientId))) {
	        $this->validateUsage();
		    $tweets = $this->search();
		    $statuses = $tweets->statuses;
		    $classify = new Social(env('ZAPI_USERNAME'), env('ZAPI_PASSWORD'));
		    $results = $classify->classify($statuses);
		    $this->logUsage();
		    set_transient($transientId, $results, 60 * 60 * 24);
	    }
	    $output = JsonOutput::create($this->input('q'), $results->getAggregatedCategories(false, 'count', 'desc'), $statuses);
	    return $this->sendJSON($output);
    }

    public function search()
    {
        $res = $this->twitter->get('https://api.twitter.com/1.1/search/tweets.json', [
            'query' => [
                'q' => $this->input('q'),
	            'count' => $this->input('count', 100),
	            'result_type' => $this->input('result_type', 'mixed')
            ]
        ]);
        $json = (string)$res->getBody();
	    return json_decode($json);
    }
}