<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/14/16
 * Time: 12:38 PM
 */

namespace Econtext;

class Container
{
    protected $instances = [];

    public function bind($key, \Closure $callback)
    {
        $this->instances[$key] = $callback;
    }

    public function make($key)
    {
        return $this->instances[$key]();
    }
}