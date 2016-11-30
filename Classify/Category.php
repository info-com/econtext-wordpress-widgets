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

	public function __construct(\Zclient\Categories\Category $category, $tweet = null) {
		$this->id = $category->getId();
		$this->name = $category->getName();
		$this->path = $category->getPath();
		$this->id_path = $category->getIdpath();
		$this->hash_id = md5(implode('+', $this->path));
		$this->vertical = $this->path[0];
		$this->secondary = $this->path[1];
		$this->tertiary = $this->path[2];
		if ($tweet) {
			$this->tweets[] = $tweet;
		}
	}

	public function addTweet($tweet)
	{
		if (!array_search($tweet, $this->tweets)) {
			$this->count++;
			$this->tweets[] = $tweet;
		}
	}
}