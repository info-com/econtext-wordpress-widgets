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
		$html = @file_get_contents($url);
		if ($html === false) {
			throw new \Exception('Web page does not exist.');
		}
		try {
			$zapi = $this->zapi->createClassify([
				'type' => 'html',
				'html' => $html
			]);
			$results = $zapi->getResults();
		} catch (\Exception $e) {
			return [];
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