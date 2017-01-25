<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 1/23/17
 * Time: 11:44 PM
 */

namespace Econtext;

use Econtext\Session;

class Tracker
{
    protected $session;

    public static $defaultVars = [
        'solved_captcha' => false,
        'usage_search' => 0,
        'usage_text' => 0,
        'usage_url' => 0,
        'usage_user' => 0,
    ];

    public static $defaultLimits = [
        'usage_search' => 10,
        'usage_text' => 10,
        'usage_url' => 10,
        'usage_user' => 10,
    ];

    public function __construct(Session $session)
    {
        $this->session = $session;
        $this->boot();
    }

    protected function boot()
    {
        foreach (self::$defaultVars as $key => $default) {
            if (!$this->session->get($key)) {
                $this->session->add($key, $default);
            }
        }
    }

    public function add($key, $value)
    {
        $this->session->add($key, $value);
    }

    public function increment($key, $hits = 1)
    {
        $hits = (int)$hits;
        if (false == ($val = $this->session->get($key))) {
            return $this->add($key, $hits);
        }
        return $this->session->update($key, $val + $hits);
    }

    public function update($key, $value)
    {
        return $this->session->update($key, $value);
    }

    public function log($key, $value = 1)
    {
        if (is_int($value)) {
            return $this->increment($key, $value);
        }
        return $this->update($key, $value);
    }

    public function get($key)
    {
        return $this->session->get($key);
    }

    public function all()
    {
        $output = [];
        foreach (static::$defaultVars as $key => $default) {
            $output[$key] = $this->session->get($key);
        }
        return $output;
    }

    public function hasReachedLimit($key)
    {
        if (!isset(static::$defaultLimits[$key])) {
            throw new \Exception('There is no limit for the key: '.$key);
        }
        $currentValue = $this->session->get($key, 0);
        if ($currentValue >= static::$defaultLimits[$key]) {
            return true;
        }
        return false;
    }
}