<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 12:05 PM
 */

namespace Econtext\Classify;

class Social extends AbstractClassify
{
    public function classify($posts) {
        try {
            $zapi = $this->zapi->createClassify([
                'type' => 'social',
                'social' => $posts
            ]);
            $results = $zapi->getResults();
        } catch (\Exception $e) {
            return [];
        }
        foreach ($results->getClassifications() as $key => $classify) {
            foreach ($classify->getScoredCategories() as $category) {
                $this->addCategory($category);
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