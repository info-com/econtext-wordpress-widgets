<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 11/29/16
 * Time: 10:56 AM
 */

namespace Econtext\Controller;

use Econtext\Container;

class ControllerFactory
{
	protected static $controllers = [
		'search' => SearchController::class,
		'url' => UrlController::class,
		'text' => TextController::class,
		'user' => UserController::class,
        'status' => SessionUser::class,
        'verify' => GoogleRecaptchaVerifyController::class,
	];

	public static function create($controllerName, Container $app, $request)
	{
		if (!array_key_exists($controllerName, static::$controllers)) {
			throw new \Exception($controllerName.' controller does not exist.');
		}
		return new static::$controllers[$controllerName]($app, $request);
	}
}