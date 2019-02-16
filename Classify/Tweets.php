<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 12:05 PM
 */

namespace Econtext\Classify;

class Tweets extends AbstractClassify
{
	public function classify($tweets) {
		$tweetText = array_map(function($d) {
			return $d->text;
		}, $tweets);
		try {
			$zapi = $this->zapi->createClassify([
				'type' => 'social',
				'social' => $tweetText
			]);
			$results = $zapi->getResults();
		} catch (\Exception $e) {
			return [];
		}
		foreach ($results->getClassifications() as $key => $classify) {
			$tweet = $tweets[$key];
			foreach ($classify->getScoredCategories() as $category) {
				$this->addCategory($category, $tweet);
			}
		}
		// Get Total Count
        $totalCount = array_reduce($this->categories, function($p, $v) {
            return $p + $v->count;
        });
		// Calculate Score
		foreach ($this->categories as &$category) {
		    $category->score = $category->count / $totalCount;
        }
		// Sort categories by count
		usort($this->categories, function($a, $b) {
			return $b->count > $a->count;
		});
		return $this->categories;
	}
}