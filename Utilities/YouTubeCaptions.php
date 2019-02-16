<?php
/**
 * Created by PhpStorm.
 * User: akatavic
 * Date: 2019-02-15
 * Time: 18:01
 */

namespace Econtext\Utilities;

use GuzzleHttp\Client;

class YouTubeCaptions
{
    protected $guzzle;

    protected $url;

    public function __construct($url)
    {
        $this->guzzle = new Client();
        $this->url = $url;
    }

    public function getCaptions($lang = 'en')
    {
        parse_str(parse_url($this->url, PHP_URL_QUERY), $query);
        $videoId = $query['v'];
        $vinfo = file_get_contents("https://www.youtube.com/get_video_info?video_id={$videoId}");
        if (false === stripos($vinfo, 'captionTracks')) {
            throw new \Exception('Does not contain caption tracks');
        }
        parse_str($vinfo, $results);
        $player = json_decode($results['player_response'], true);
        $captionTrack = null;
        foreach ($player['captions']['playerCaptionsTracklistRenderer']['captionTracks'] as $track) {
            if (preg_match("/^\.{$lang}/", $track['vssId'])) {
                $captionTrack = $track;
                continue;
            }
            if (preg_match("/^a\.{$lang}/", $track['vssId'])) {
                $captionTrack = $track;
                continue;
            }
        }
        $subtitlesXmlStr = file_get_contents($captionTrack['baseUrl']);
        $subtitlesText = strip_tags(str_replace('</text>', "\n", $subtitlesXmlStr));
        $subtitlesList = explode("\n", htmlspecialchars_decode($subtitlesText));
        return $subtitlesList;
    }
}