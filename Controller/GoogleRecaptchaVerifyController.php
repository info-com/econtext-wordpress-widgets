<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 1/25/17
 * Time: 11:40 AM
 */

namespace Econtext\Controller;

use GuzzleHttp\Client;

class GoogleRecaptchaVerifyController extends InternalApiController
{
    /**
     * @var $guzzle Client
     */
    protected $guzzle;

    public function __construct( $app, $request )
    {
        parent::__construct( $app, $request );
        $this->guzzle = $app->make('guzzle');
    }

    public function connect()
    {
        $gCaptchaResponse = $this->input('g-captcha-response');
        $response = $this->guzzle->post('https://www.google.com/recaptcha/api/siteverify', [
            'query' => [
                'response' => $gCaptchaResponse,
                'secret' => getenv('GOOGLE_RECAPTCHA_SECRETKEY')
            ]
        ]);
        $responseJSON = json_decode($response->getBody());
        if (!$responseJSON->success) {
            return $this->sendError('Captcha could not be verified', 400);
        }
        $this->app->session()->update('solved_captcha', true);
        return $this->sendJSON($responseJSON->success);
    }
}