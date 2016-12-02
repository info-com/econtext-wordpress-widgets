<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 12/2/16
 * Time: 11:46 AM
 */

namespace Econtext\Classify;


class JsonOutput
{
	public $categories;
	public $category_count = 0;
	public $query_list = [];
	public $twitter_count = 0;

	public static function create($query, $categories, $tweets = null)
	{
		$output = new self();
		$output->categories = $categories;
		$output->category_count = count($categories);
		if ($tweets) {
			$output->twitter_count = count($tweets);
		}
		$output->query_list[] = [
			'query' => $query,
			'ec_category_count' => $output->category_count,
			'ec_tweet_count' => $output->twitter_count
		];
		return $output;
	}
}