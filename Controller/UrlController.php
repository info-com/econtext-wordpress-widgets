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
	    $url = $this->input('query', 'null');
        if (!$url) {
            return $this->sendError('You must include a url as the query.');
        }
	    if (! preg_match('/^https?\:\/\//', $url)) {
	        $url = 'http://'.$url;
        }
		$transientId = md5('?'.$url);
		if (false === ($results = get_transient($transientId))) {
		    $this->validateUsage();
			$classify = new Url($this->app);
			try {
                $results = $classify->classify($url);
            } catch (\Exception $e) {
			    return $this->sendError($e->getMessage());
            }
			$this->logUsage();
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		$output = JsonOutput::create($url, $results);
		return $this->sendJSON($output);
	}
}