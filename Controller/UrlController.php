<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 3:36 PM
 */

namespace Econtext\Controller;

use Econtext\Classify\Url;

class UrlController extends InternalApiController
{
	public function connect()
	{
		$transientId = md5($this->input('url'));
		if (false === ($results = get_transient($transientId))) {
			$classify = new Url($this->app);
			$results = $classify->classify($this->input('url'));
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		return $this->sendJSON($results);
	}
}