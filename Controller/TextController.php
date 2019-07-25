<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 11:59 PM
 */

namespace Econtext\Controller;

use Econtext\ClassifyApi\Text;
use Econtext\Classify\JsonOutput;

class TextController extends InternalApiController
{
    protected $usageName = 'usage_text';

	public function connect()
	{
	    $text = $this->input('query', null);
	    if (! $text) {
	        return $this->sendError('You must include text as the query.');
        }
		$transientId = md5('$'.$text);
		if (false === ($results = get_transient($transientId))) {
		    $this->validateUsage();
			$classify = new Text(env('ZAPI_USERNAME'), env('ZAPI_PASSWORD'));
			try {
                $results = $classify->classify($text);
            } catch (\Exception $e) {
			    return $this->sendError($e->getMessage());
            }
			$this->logUsage();
			set_transient($transientId, $results, 60 * 60 * 24);
		}
		$output = JsonOutput::create($text, $results->getAggregatedCategories(false, 'score', 'desc'));
		return $this->sendJSON($output);
	}
}