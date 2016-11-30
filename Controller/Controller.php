<?php
/**
 * Controller for user-facing part of the app 
 * @author Ante Katavic <akatavic@zenya.com>
 */
namespace Econtext\Controller;

use Zenya\Model\User;
abstract class Controller implements ControllerInterface {
	
	protected $request;
	protected $view;
	protected $input;
	protected $submitted = false;
	protected $errors = array();
	protected $message;
	
	public static $userInput = 'zcinput';
	public static $userSubmit = 'submit';
	public static $dashboard = 'my-dashboard';
	
	public function __construct() {
		$this->request = $_REQUEST;
		$this->input = $this->request[self::$userInput];
		$this->submitted = !empty($this->request[self::$userSubmit]);
	}	
	
	protected function isSubmitted() {
		return (bool)$this->submitted;
	}
	
	protected function setMessage($msg) {
		$this->message = $msg;
	}
	
	public function hasMessage() {
		return isset($this->message);
	}
	
	public function redirectToDashboard() {
		wp_redirect(get_home_url().'/'.static::$dashboard, 302);
		exit;
	}
	
	protected function valid() {
		foreach ($this->requiredFields as $name => $value) {
			if (empty($this->input[$value])) {
				$this->setError('You must fill out all required fields.');
				return false;
			}
		}
		return true;
	}
	
	protected function logIn($userName, $password) {
		$credentials = array(
			'user_login' => $userName,
			'user_password' => $password,
			'remember' => true
		);
		$login = wp_signon($credentials, false);
		if (is_wp_error($login)) {
			$this->setError($login->get_error_message());
			return false;
		}
		// need to run these next functions in order to set the current user without refreshing the page
		wp_set_current_user($login->ID, $userName);
		wp_set_auth_cookie($login->ID);
		return new User($login->ID);
	}	
	
	protected function setError($msg) {
		$this->errors[] = $msg;
	}
	
	public function hasErrors() {
		return !empty($this->errors);
	}
	
	public function getErrors() {
		return $this->errors;
	}
	
	public function getMessage() {
		return $this->message;
	}
	
	public function getView() {
		return $this->view;
	}
}