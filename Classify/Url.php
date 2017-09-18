<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 3:38 PM
 */

namespace Econtext\Classify;


class Url extends AbstractClassify
{
	public function classify( $url ) {
		try {
			$zapi = $this->zapi->createClassify([
				'type' => 'url',
				'url' => $url
			]);
			$results = $zapi->getResults();
		} catch (\Exception $e) {
			throw new \Exception("Unable to connect to {$url}");
		}
		foreach ($results->getClassification()->getScoredCategories() as $category) {
			$this->addCategory($category);
		}
		// Sort categories by score
		usort($this->categories, function($a, $b) {
			return $b->score > $a->score;
		});
		return $this->categories;
	}
}