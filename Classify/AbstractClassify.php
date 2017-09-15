<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 12:03 PM
 */

namespace Econtext\Classify;

use Econtext\Container;

abstract class AbstractClassify
{
	protected $app;
	protected $zapi;

	public $categories = [];

	public function __construct(Container $app)
	{
		$this->app = $app;
		$this->zapi = $this->app->make('zapi');
	}

	protected function addCategory($categoryObj, $tweet = null)
	{
	    $category = $categoryObj->category;
		$id = $category->getId();
		if (!array_key_exists($id, $this->categories)) {
			$newCategory = new Category($categoryObj, $tweet);
			$this->categories[$newCategory->id] = $newCategory;
		} else {
			if ($tweet) {
				$this->categories[$id]->addTweet($tweet);
			} else {
				$this->categories[$id]->count++;
			}
		}
	}

	abstract public function classify($data);
}