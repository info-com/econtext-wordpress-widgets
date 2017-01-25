<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 12/2/16
 * Time: 11:46 AM
 */

namespace Econtext\Classify;

use Econtext\Session;

class JsonOutput
{
	public $categories;
	public $category_count = 0;
	public $query_list = [];
	public $twitter_count = 0;

	public static function create($query = null, $categories = null, $tweets = null, $tracking = null)
	{
		$output = new self();
		if ($categories) {
            $output->categories = $categories;
            $output->category_count = count($categories);
        }
		if ($tweets) {
			$output->twitter_count = count($tweets);
		}
		if ($query) {
            $output->query_list[] = [
                'query' => $query,
                'ec_category_count' => $output->category_count,
                'ec_tweet_count' => $output->twitter_count
            ];
        }
		if ($tracking) {
		    $output->usage = $tracking;
        }
		return $output;
	}

	public function append($key, $value)
    {
        $this->$key = $value;
    }
}