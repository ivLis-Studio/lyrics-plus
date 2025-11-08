const Providers = {
  spotify: async (info) => {
    const result = {
      uri: info.uri,
      karaoke: null,
      synced: null,
      unsynced: null,
      provider: "Spotify",
      copyright: null,
    };

    const baseURL = "https://spclient.wg.spotify.com/color-lyrics/v2/track/";
    const id = info.uri.split(":")[2];
    let body;
    try {
      body = await Spicetify.CosmosAsync.get(
        `${baseURL + id}?format=json&vocalRemoval=false&market=from_token`
      );
    } catch {
      return { error: "Request error", uri: info.uri };
    }

    const lyrics = body.lyrics;
    if (!lyrics) {
      return { error: "No lyrics", uri: info.uri };
    }

    const lines = lyrics.lines;
    if (lyrics.syncType === "LINE_SYNCED") {
      result.synced = lines.map((line) => ({
        startTime: line.startTimeMs,
        text: line.words,
      }));
      result.unsynced = result.synced;
    } else {
      result.unsynced = lines.map((line) => ({
        text: line.words,
      }));
    }

    // result.provider = lyrics.provider;

    return result;
  },
  lrclib: async (info) => {
    const result = {
      uri: info.uri,
      karaoke: null,
      synced: null,
      unsynced: null,
      provider: "lrclib",
      copyright: null,
    };

    let list;
    try {
      list = await ProviderLRCLIB.findLyrics(info);
    } catch {
      result.error = "No lyrics";
      return result;
    }

    const synced = ProviderLRCLIB.getSynced(list);
    if (synced) {
      result.synced = synced;
    }

    const unsynced = synced || ProviderLRCLIB.getUnsynced(list);

    if (unsynced) {
      result.unsynced = unsynced;
    }

    return result;
  },
  ivlyrics: async (info) => {
    const result = {
      uri: info.uri,
      karaoke: null,
      synced: null,
      unsynced: null,
      provider: "ivLyrics",
      copyright: null,
    };

    let body;
    try {
      body = await ProviderIvLyrics.findLyrics(info);
      if (body.error) {
        throw "";
      }
    } catch {
      result.error = "No lyrics";
      return result;
    }

    const synced = ProviderIvLyrics.getSynced(body);
    if (synced) {
      result.synced = synced;
    }

    const unsynced = synced || ProviderIvLyrics.getUnsynced(body);
    if (unsynced) {
      result.unsynced = unsynced;
    }

    const karaoke = ProviderIvLyrics.getKaraoke(body);
    if (karaoke) {
      result.karaoke = karaoke;
    }

    return result;
  },
  local: (info) => {
    let result = {
      uri: info.uri,
      karaoke: null,
      synced: null,
      unsynced: null,
      provider: "local",
    };

    try {
      const savedLyrics = JSON.parse(
        StorageManager.getItem("lyrics-plus:local-lyrics")
      );
      const lyrics = savedLyrics[info.uri];
      if (!lyrics) {
        throw "";
      }

      result = {
        ...result,
        ...lyrics,
      };
    } catch {
      result.error = "No lyrics";
    }

    return result;
  },
};
