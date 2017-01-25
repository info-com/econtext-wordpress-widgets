<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 1/24/17
 * Time: 2:57 PM
 */

namespace Econtext\Controller;

use Econtext\Classify\JsonOutput;

class SessionUser extends InternalApiController
{
    public function __construct( $app, $request )
    {
        parent::__construct( $app, $request );
    }

    public function connect()
    {
        $output = JsonOutput::create(null, null, null, $this->tracker->all());
        $this->sendJSON($output);
    }
}