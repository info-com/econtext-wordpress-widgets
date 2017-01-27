<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 11:59 PM
 */

namespace Econtext\Controller;

use Econtext\Classify\Text;
use Econtext\Classify\JsonOutput;

class TextController extends InternalApiController
{
    protected $usageName = 'usage_text';

	public function connect()
	{
		$transientId = md5($this->input('text'));
		if (false === ($results = get_transient($transientId))) {
		    $this->validateUsage();
			$classify = new Text($this->app);
			$results = $classify->classify($this->input('text'));
			$this->logUsage();
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		$output = JsonOutput::create($this->input('text'), $results);
		return $this->sendJSON($output);
	}
}