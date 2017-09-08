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

	public function __construct($app, $request)
	{
		parent::__construct($app, $request);
		$this->twitter = $this->app->make('twitter');
	}

	public function connect()
	{
		$transientId = md5('@'.$this->input('screen_name'));
		if (false === ($results = get_transient($transientId))) {
            $this->validateUsage();
			$results = [];
			try {
                $tweets = $this->user();
            } catch (\Exception $e) {
			    return $this->sendError('The user does not exist.');
            }
			$results['tweets'] = $tweets;
			$classify = new Tweets($this->app);
			$results['categories'] = $classify->classify($tweets);
			$this->logUsage();
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		$output = JsonOutput::create($this->input('screen_name'), $results['categories'], $results['tweets'], $this->tracker->all());
		return $this->sendJSON($output);
	}

	public function user()
	{
		$res = $this->twitter->get('https://api.twitter.com/1.1/statuses/user_timeline.json', [
			'query' => [
				'screen_name' => $this->input('screen_name'),
				'count' => $this->input('count', 200)
			]
		]);
		$json = (string)$res->getBody();
		return json_decode($json);
	}
}