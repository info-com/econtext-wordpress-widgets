<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/30/16
 * Time: 12:16 AM
 */

namespace Econtext\Controller;

use Econtext\Classify\Tweets;
use Econtext\Classify\JsonOutput;

class UserController extends InternalApiController
{
    protected $twitter;
    protected $usageName = 'usage_user';
    protected $screenName;
    protected $count;

	public function __construct($app, $request)
	{
		parent::__construct($app, $request);
		$this->twitter = $this->app->make('twitter');
	}

	public function connect()
	{
	    $this->screenName = $this->input('query', null);
	    $this->count = $this->input('count', 200);
	    if (! $this->screenName) {
	        return $this->sendError('You must supply a screen_name as the query.');
        }
	    if (false !== strpos($this->screenName, '@')) {
	        $this->screenName = str_replace('@', '', $this->screenName);
        }

		$transientId = md5('@'.$this->screenName);
		//if (false === ($results = get_transient($transientId))) {
        if (true) {
            $this->validateUsage();
			$results = [];
			try {
                $tweets = $this->user();
            } catch (\Exception $e) {
			    return $this->sendError($e->getMessage());
            }
			$results['tweets'] = $tweets->statuses;
			$classify = new Tweets($this->app);
			$results['categories'] = $classify->classify($tweets->statuses);
			$this->logUsage();
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		$output = JsonOutput::create($this->screenName, $results['categories'], $results['tweets'], $this->tracker->all());
		return $this->sendJSON($output);
	}

	public function user()
	{
		$res = $this->twitter->get('https://api.twitter.com/1.1/search/tweets.json', [
			'query' => [
				'q' => "from:{$this->screenName}",
				'count' => $this->count
			]
		]);
		$json = (string)$res->getBody();
		return json_decode($json);
	}
}