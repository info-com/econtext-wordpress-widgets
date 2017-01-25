<?php
/**
 * Handles internal api calls for AJAX
 * @author Ante Katavic <akatavic@zenya.com>
 */

namespace Econtext\Controller;

use Econtext\Container;
use Econtext\Tracker;

class InternalApiController implements ControllerInterface
{

    /**
     * @var Container $app
     */
    protected $app;

	protected $request;

	/**
     * @var Tracker $tracker
     */
    protected $tracker;

    protected $usageName;
	
	public function __construct($app, $request)
	{
	    $this->app = $app;
		$this->request = $request;
		$this->tracker = $app->make('tracker');
	}
	
	/**
	 * calls a method for the controller to run
	 * @param string $method the method to be called
	 * @param mixed $arg argument to pass to the method
	 * @param array $options associative array of options
	 * @return boolean|mixed false on error
	 */
	public function action($method, $arg, array $options = array()) {
		$this->options = $options;
		if (!method_exists($this, $method)) {
			return false;
		}
		return call_user_func(array($this, $method), $arg);
	}

	public function sendJSON($response)
	{
		header("Content-Type: application/json; charset=utf8");
		echo json_encode($response);
		die();
	}
	
	public function sendResponse($response)
	{
		ob_start("ob_gzhandler");
		header("Content-Type: application/json; charset=utf8");
		echo json_encode($response);
		ob_end_flush();
	}
	
	public function connect() 
	{
		$response = null;
		switch ($this->route) {
			case 'twitter':
				$search = new Search();
				$response = $search->action($this->action, $this->identifier, $_REQUEST);
				break;
			default:
				$response = 'Nothing to see here.';
				break;
		}
		if (!$response) {
			header("HTTP/1.0 404 Not Found");
			wp_send_json_error('Not Found');
		}
		else {
			$this->sendResponse($response);
		}
	}
	
	public function sendError($message, $code = '404')
	{
		header("HTTP/1.0 {$code} Not Found");
		header("Content-type: application/json");
		echo json_encode(['error' => $message]);
		die();
	}

	protected function input($key, $default = null)
    {
        return (!empty($this->request[$key]))
            ? $this->request[$key]
            : $default;
    }

	protected function createJob(array $params)
	{
		return json_encode($params);
	}
}