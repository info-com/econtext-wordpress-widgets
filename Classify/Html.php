<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 3:38 PM
 */

namespace Econtext\Classify;


class Html extends AbstractClassify
{
    public function classify($htmlStr) {
        try {
            $zapi = $this->zapi->createClassify([
                'type' => 'html',
                'html' => $htmlStr
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