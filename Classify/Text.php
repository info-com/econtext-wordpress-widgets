<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/30/16
 * Time: 12:01 AM
 */

namespace Econtext\Classify;


class Text extends AbstractClassify
{
	public function classify( $text ) {
		try {
			$zapi = $this->zapi->createClassify([
				'type' => 'text',
				'text' => $text
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