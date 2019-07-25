<?php


namespace Econtext\ClassifyApi;

use GuzzleHttp\Psr7\Response;

class Result implements \ArrayAccess
{
    /**
     * @var $response Response
     */
    public $response;

    public $body;

    public function __construct(Response $response)
    {
        $this->response = $response;
        $this->body = json_decode($response->getBody()->__toString(), true);
    }

    public function getResponse()
    {
        return $this->response;
    }

    public function getCategories()
    {
        $results = (isset($this->body['econtext']['classify']['results'])) ? $this->body['econtext']['classify']['results'] : [$this->body['econtext']['classify']];
        foreach ($results as $index => $result) {
            foreach ($result['scored_categories'] as $scoredCat) {
                $fullCat = array_merge($scoredCat, $this->body['econtext']['classify']['categories'][$scoredCat['category_id']]);
                $fullCat['index'] = $index;
                yield $fullCat;
            }
        }
    }

    public function getAggregatedCategories($preserveKeys = false, $sortBy = 'count', $order = 'desc')
    {
        $aggCats = [];
        foreach ($this->getCategories() as $category) {
            $categoryId = $category['category_id'];
            $catIndex = $category['index'];
            $category['index'] = [$catIndex];
            if (!array_key_exists($categoryId, $aggCats)) {
                $category['count'] = 1;
                $aggCats[$categoryId] = $category;
            } else {
                $aggCats[$categoryId]['count']++;
                if (!in_array($catIndex, $aggCats[$categoryId]['index'])) {
                    array_push($aggCats[$categoryId]['index'], $catIndex);
                }
            }
        }
        uasort($aggCats, function($a,$b) use($sortBy, $order) {
            if ($order == 'asc') {
                return $a[$sortBy] > $b[$sortBy];
            }
            if ($order == 'desc') {
                return $b[$sortBy] > $a[$sortBy];
            }
        });
        return ($preserveKeys) ? $aggCats : array_values($aggCats);
    }

    public function offsetExists($offset)
    {
        return isset($this->body[$offset]);
    }

    public function offsetGet($offset)
    {
        return $this->body[$offset];
    }

    public function offsetSet($offset, $value)
    {
        $this->body[$offset] = $value;
    }

    public function offsetUnset($offset)
    {
        unset($this->body[$offset]);
    }
}