<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 12:05 PM
 */

namespace Econtext\Classify;

use Econtext\ClassifyApi\QuickClassify;

class Tweets extends AbstractClassify
{
	public function classify($tweets) {
		$tweetText = array_map(function($d) {
			return $d->text;
		}, $tweets);
		try {
            $quickClassify = new QuickClassify();
            $results = $quickClassify->social($tweetText);
		} catch (\Exception $e) {
			return [];
		}
		foreach ($results['econtext']['classify']['results'] as $key => $classify) {
			$tweet = $tweets[$key];
			foreach ($classify['scored_categories'] as $category) {
			    $fullCategory = array_merge($category, $results['econtext']['classify']['categories'][$category['category_id']]);
				$this->addCategory($fullCategory, $tweet);
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