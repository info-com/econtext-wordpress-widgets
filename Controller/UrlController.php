<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 3:36 PM
 */

namespace Econtext\Controller;

use Econtext\Classify\Url;
use Econtext\Classify\JsonOutput;

class UrlController extends InternalApiController
{
    protected $usageName = 'usage_url';

	public function connect()
	{
		$transientId = md5($this->input('url'));
		if (false === ($results = get_transient($transientId))) {
		    $this->validateUsage();
			$classify = new Url($this->app);
			$results = $classify->classify($this->input('url'));
			$this->logUsage();
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		$output = JsonOutput::create($this->input('url'), $results);
		return $this->sendJSON($output);
	}
}