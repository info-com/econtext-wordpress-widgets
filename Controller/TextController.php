<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 11:59 PM
 */

namespace Econtext\Controller;

use Econtext\Classify\Text;

class TextController extends InternalApiController
{
	public function connect()
	{
		$transientId = md5($this->input('text'));
		if (false === ($results = get_transient($transientId))) {
			$classify = new Text($this->app);
			$results = $classify->classify($this->input('text'));
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		return $this->sendJSON($results);
	}
}