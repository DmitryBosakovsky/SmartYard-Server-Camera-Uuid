<?php

    /**
     * backends providers namespace
     */

    namespace backends\providers
    {

        use http\Message;

        /**
         * LanTa's variant of flash calls and sms sending
         */
        class lanta extends providers
        {

            /**
             * @inheritDoc
             */
            public function getJson()
            {
                try {
                    if (file_exists($this->config["backends"]["providers"]["providers.json"])) {
                        return file_get_contents($this->config["backends"]["providers"]["providers.json"]);
                    } else {
                        return "";
                    }
                } catch (\Exception $e) {
                    return false;
                }
            }

            /**
             * @inheritDoc
             */
            public function putJson($text)
            {
                try {
                    json_decode($text);
                    file_put_contents($this->config["backends"]["providers"]["providers.json"], $text);
                } catch (\Exception $e) {
                    setLastError($e->getMessage());
                    return false;
                }

                return true;
            }
        }
    }
