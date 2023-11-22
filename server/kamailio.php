<?php
    /**
     * Kamailio AUTH API
     * Generate Hash Authentication 1 (HA1) for kamailio auth module
     */
    mb_internal_encoding("UTF-8");
    require_once "utils/error.php";
    require_once "utils/loader.php";
    require_once "utils/checkint.php";
    require_once "utils/db_ext.php";
    require_once "utils/api_exec.php";
    require_once "utils/api_respone.php";
    require_once "backends/backend.php";

    // Set response header
    header('Content-Type: application/json');

    $SIP_SUBSCRIBER_LENGTH = 10;

    /**
     * Get Authorization Header
     * */
    function getAuthorizationHeader(): ?string
    {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        }
        else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        }
        return $headers;
    }

    /**
     * Get access token from header
     * */
    function getBearerToken(): ?string
    {
        $headers = getAuthorizationHeader();
        if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Load app config
     * @return mixed
     */
    function loadConfiguration(): mixed
    {
        $config = @json_decode(file_get_contents(__DIR__ . "/config/config.json"), true);
        if (!$config) {
            $config = @json_decode(json_encode(yaml_parse_file(__DIR__ . "/config/config.yml")), true);
        }

        if (!$config) {
            response(500, null, null, "config is empty");
            exit(1);
        }

        return $config;
    }

    // Check and return Kamailio configuration
    function getKamailioConfig($config)
    {
        // Check if Kamailio API defined
        if (!$config["api"]["kamailio"]) {
            response(500, null, null, 'No kamailio API defined in configuration');
            exit(1);
        }

        foreach ($config['backends']['sip']['servers'] as $server) {
            if ($server['type'] === 'kamailio') {
                return $server;
            }
        }
        response(500, null, null, "No Kamailio configuration");
        exit(1);
    }

    //Auth
    (function (){
        $conf = loadConfiguration();
        $kamailioConf = getKamailioConfig($conf);

        $currentToken = getBearerToken();

        if(!$currentToken || $currentToken !== $kamailioConf['auth_token']){
            response(498, null, null, 'Invalid token or empty');
            exit(1);
        }

        return null;
    })();

    // ----
    $config = loadConfiguration();

    // Check if backend is defined
    if (@!$config["backends"]) {
        response(500, null, null, 'no backends defined' );
        exit(1);
    }

    // DB connection
    try {
        $db = new PDO_EXT(@$config["db"]["dsn"], @$config["db"]["username"], @$config["db"]["password"], @$config["db"]["options"]);
    } catch (Exception $err) {
        response(500, [
            "can't open database " . $config["db"]["dsn"],
            $err->getMessage()],
        );
        exit(1);
    }

    [
        'address' => $kamailio_address,
        'json_rpc_path' => $kamailio_rpc_path,
        'json_rpc_port' => $kamailio_rpc_port,
        'auth_token' => $kamailio_token,
    ] = getKamailioConfig($config);

    // make kamailio JSON RPC url example: http://example-host.com:8080/RPC';
    $KAMAILIO_RPC_URL = 'http://'.$kamailio_address.':'.$kamailio_rpc_port.'/'.$kamailio_rpc_path;

    $request_method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER["REQUEST_URI"];

    // parse Kamailio API path from config
    $kamailioApi = parse_url($config["api"]["kamailio"]);

    // update a patch process
    if ($kamailioApi && $kamailioApi['path']) {
        $path = substr($path, strlen($kamailioApi['path']));
    }

    if ($path && $path[0] == '/') {
        $path = substr($path, 1);
    }

    // ----- Handle POST request
    if ($request_method === 'POST' && $path === 'subscriber/hash') {
        $postData = json_decode(file_get_contents("php://input"), associative:  true);

        /**
         *  TODO:
         *      -   verification endpoint and payload
         *      -   check domain
         */
        [$subscriber, $sipDomain] = explode('@', explode(':', $postData['from_uri'])[1]);

        // validate 'sip domain' field extension@your-sip-domain
        if ($sipDomain !== $kamailio_address){
            response(400, null, null, 'Invalid Received Sip Domain');
            exit(1);
        }

        if (strlen((int)$subscriber) !== $SIP_SUBSCRIBER_LENGTH ) {
            response(400, null, null, 'Invalid Received Subscriber UserName');
            exit(1);
        }

        //Get subscriber and validate
        $flat_id = (int)substr($subscriber, 1);
        $households = loadBackend("households");

        $flat = $households->getFlat($flat_id);

        if ($flat && $flat['sipEnabled']) {
            $sipPassword = $flat['sipPassword'];
            //md5(username:realm:password)
            $ha1 = md5($subscriber .':'. $kamailio_address .':'. $sipPassword);
            response(200, ['ha1' => $ha1] );
        } else {
            //sip disabled
            response(403, false, false, 'SIP Not Enabled');
        }
        exit(1);
    }

    // ----- Handle GET request
    /**
     * TODO:
     *      - remove registration ?
     *      - refactor api response
     *      - add SIP PING 'kamctl ping sip:4000000013@192.168.13.84'
     */
    if ($request_method=== 'GET') {
        $path = explode('/', $path);
        if (sizeof($path) === 2 && $path[0] === 'subscriber' && (strlen((int)$path[1]) === 10)){
            $subscriber = $path[1];
            $postData = [
                "jsonrpc" => "2.0",
                "method" => "ul.lookup",
                "params" => ["location", $subscriber],
                "id" => 1
            ];

            try {
                $get_subscriber_info = apiExec('POST', $KAMAILIO_RPC_URL, $postData, false, false);
                response(200, json_decode($get_subscriber_info));
            } catch (Exception $err) {
                response(500, [$err->getMessage()]);
            }

            exit(1);
        }

        //  get all active subscribers
        if ($path[0] === 'subscribers'){

            $postData = array(
                "jsonrpc" => "2.0",
                "method" => "ul.dump",
                "params" => [],
                "id" => 1
            );

            $response = apiExec('POST', $KAMAILIO_RPC_URL, $postData, false, false);

            echo ($response);
            exit(1);
        }

    }

    response(400);

    /**
     *  Example cURL Request for Kamailio API
     *
     * @example
     *  curl --location 'http://smart-yard.server:8876/kamailio/subscribers' \
     *  --header 'Content-Type: application/json' \
     *  --header 'Authorization: Bearer example_token_from config' \
     *  --data-raw '{
     *      "from_uri":"sip:4000000019@kamailio.smart-yard.server"
     *  }'
     */
