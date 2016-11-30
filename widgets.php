<?php
/*
Plugin Name: eContext Widgets
Plugin URI: http://classify.econtext.com
Description: Embed Classify Widgets in WordPress
Author: Ante Katavic
Version: 1.0
Author URI: http://classify.econtext.com
*/
require_once __DIR__.'/vendor/autoload.php';

use Econtext\Container;
use Econtext\Controller\ControllerFactory;
use Dotenv\Dotenv;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Subscriber\Oauth\Oauth1;
use Zclient\Zclient;

class Widgets
{
    protected $app;
    protected $viewsPath;
    protected $agent;

    public static $internalApiBaseUrl = 'ec_api';

    public function __construct(Container $app)
    {
        $this->app = $app;
        $this->viewsPath = plugin_dir_path(__FILE__).'views/';
        $this->agent = new \Jenssegers\Agent\Agent();
        // determine if we need to access a user-facing page or an api lookup
	    $uri = strtok($_SERVER['REQUEST_URI'], '?');
        if (preg_match('/'.static::$internalApiBaseUrl.'\/([^.]+)/', $uri, $matches)) {
            $action = $matches[1];
            add_action('do_parse_request', array($this, 'loadController'), 10, 2);
	        do_action('do_parse_request', $action, $_REQUEST);
        }
        $this->loadScripts();
    }

    public function loadController($action, $request)
    {
	    $controller = ControllerFactory::create($action, $this->app, $request);
	    return $controller->connect();
    }

    protected function loadView($view)
    {
        $view = file_get_contents($this->viewsPath.$view);
        return $view;
    }

    public function handle($atts, $content)
    {
        if ($this->agent->isMobile()) {
            return $this->displayBar();
        }
        return $this->displayBubbles();
    }

    protected function loadScripts()
    {
        // set up jQuery
        wp_register_script('jq', 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js');
        wp_enqueue_script('jq');
        // set up d3
        wp_register_script('d3.js', plugins_url('js/d3.js', __FILE__));
        wp_enqueue_script('d3.js');
        // register ecViz.js
        wp_register_script('ecViz.js', plugins_url('js/ecViz.js', __FILE__));
        wp_enqueue_script('ecViz.js');
        // register textfill
        wp_register_script('jquery.textfill.min.js', plugins_url('js/jquery.textfill.min.js', __FILE__));
        wp_enqueue_script('jquery.textfill.min.js');
    }

    protected function displayBubbles()
    {
        return $this->loadView('bubbles.phtml');
    }

    protected function displayBar()
    {
        return $this->loadView('bar.phtml');
    }
}

/**
 * Dumps and Dies - A nicer formatted var_dump
 * @param $var any variable
 */
function dd($var)
{
	ob_start();
	var_dump($var);
	$output = ob_get_clean();
	$output = preg_replace("/=>(\s+)/m", ' => ', $output);
	echo "<pre>$output</pre>";
	die();
}

$dotenv = new Dotenv(__DIR__);
$dotenv->load();

// Sets up the container
$app = new Container();
$app->bind('twitter', function() {
    $stack = HandlerStack::create();
    $middleware = new Oauth1([
        'consumer_key' => getenv('TWITTER_CONSUMER_KEY'),
        'consumer_secret' => getenv('TWITTER_CONSUMER_SECRET'),
        'token' => getenv('TWITTER_TOKEN'),
        'token_secret' => getenv('TWITTER_TOKEN_SECRET')
    ]);
    $stack->push($middleware);
    $client = new Client([
        'base_uri' => 'https://api.twitter.com/1.1/',
        'handler' => $stack,
        'auth' => 'oauth'
    ]);
    return $client;
});
$app->bind('zapi', function() {
	$config = [
		'username' => getenv('ZAPI_USERNAME'),
		'password' => getenv('ZAPI_PASSWORD'),
		'companyId' => getenv('ZAPI_COMPANYID')
	];
	$client = Zclient::factory($config);
	return $client;
});

// Set up the shortcode for WP
$widgetsObj = new Widgets($app);
add_shortcode('ec_widget', [$widgetsObj, 'handle']);