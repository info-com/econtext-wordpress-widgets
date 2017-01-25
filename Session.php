<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 1/20/17
 * Time: 11:23 AM
 */

namespace Econtext;


class Session
{
    public function __construct()
    {
        if (!session_id()) {
            session_start();
        }
    }

    public function add($key, $value)
    {
        $_SESSION[$key] = $value;
    }

    public function update($key, $value)
    {
        return $this->add($key, $value);
    }

    public function get($key, $default = null)
    {
        if (!isset($_SESSION[$key])) {
            return $default;
        }
        return $_SESSION[$key];
    }

    public function remove($key)
    {
        unset($_SESSION[$key]);
    }

    public function id()
    {
        return session_id();
    }

    public function flush()
    {
        unset($_SESSION);
    }

    public function dump()
    {
        echo "<pre>";
        foreach ($_SESSION as $key => $value) {
            if (is_bool($value)) {
                $value = ($value === true)
                    ? 'true'
                    : 'false';
            }
            echo "{$key} => {$value}".PHP_EOL;
        }
        echo "</pre>";
    }
}