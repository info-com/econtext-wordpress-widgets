<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 12:05 PM
 */

namespace Econtext\Classify;

class Category
{
	public $id;
	public $name;
	public $path;
	public $id_path;
	public $vertical;
	public $secondary;
	public $tertiary;
	public $tweets = [];
	public $hash_id;
	public $count = 1;
	public $counts_list = [];

	public function __construct($category, $tweet = null) {
		$this->id = $category['category_id'];
		$this->name = $category['name'];
		$this->path = $category['path'];
		$this->id_path = $category['idpath'];
		$this->hash_id = md5(implode('+', $this->path));
		$this->vertical = $this->path[0];
		$this->secondary = $this->path[1];
		$this->tertiary = $this->path[2];
		$this->score = $category['score'];
		if ($tweet) {
			$this->tweets[] = $tweet;
		}
	}

	public function addTweet($tweet)
	{
		if (false === array_search($tweet, $this->tweets)) {
		    $tweet->path = $this->path;
			$this->count++;
			$this->tweets[] = $tweet;
		}
	}
}