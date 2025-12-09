// English language file for Lyrics Plus
window.LANG_EN = {
  "meta": {
    "language": "English",
    "code": "en",
    "author": "lyrics-plus"
  },
  "tabs": {
    "general": "General",
    "appearance": "Appearance",
    "behavior": "Behavior",
    "providers": "Providers",
    "advanced": "Advanced",
    "fullscreen": "Fullscreen",
    "debug": "Debug",
    "about": "About"
  },
  "sections": {
    "language": "Language",
    "visualEffects": "Visual Effects",
    "visualEffectsSubtitle": "Customize visual elements of the lyrics screen",
    "syncMode": "Sync Mode",
    "syncModeSubtitle": "Configure lyrics synchronization method",
    "typography": "Typography",
    "typographySubtitle": "Adjust the style of lyrics text",
    "textShadow": "Text Shadow",
    "textShadowSubtitle": "Add shadow effects to lyrics text",
    "updateCheck": "Update Check",
    "backgroundOpacity": "Background Opacity",
    "contentWidth": "Content Width",
    "japaneseConversion": "Japanese Conversion",
    "displayContent": "Display Content",
    "autoTranslation": "Auto Translation",
    "lyrics": "Lyrics",
    "playBar": "Playbar Button",
    "autoScroll": "Auto Scroll",
    "animation": "Animation",
    "karaoke": "Karaoke",
    "syncedLyricsContent": "Synced Lyrics Content",
    "unsyncedLyricsContent": "Unsynced Lyrics Content",
    "customPreview": "Custom Preview",
    "providerUsage": "Provider Usage",
    "providerUsageSubtitle": "Configure lyrics providers to use",
    "trackSyncInfo": "Track Sync Info",
    "customDatabase": "Custom Database",
    "debug": "Debug",
    "github": "GitHub",
    "maintainers": "Maintainers",
    "contributors": "Contributors",
    "fadWarningTitle": "⚠️ Full Screen Extension Active",
    "fadWarningDesc": "Not supported while Full Screen extension is active.",
    "fadWarningTip": "Change alignment in Full Screen's own settings.",
    "desktopOverlay": "Desktop Overlay",
    "desktopOverlaySubtitle": "Display lyrics as a desktop overlay"
  },
  "overlay": {
    "enabled": {
      "label": "Enable Desktop Overlay",
      "desc": "Send lyrics to the desktop overlay app"
    },
    "status": {
      "connected": "✓ Connected",
      "disconnected": "Not connected",
      "checking": "Checking..."
    },
    "openApp": "Open App",
    "download": "Download App",
    "downloadDesc": "Download the overlay app if it's not installed"
  },
  "settings": {
    "language": {
      "label": "Language",
      "desc": "Select the language for the extension"
    },
    "alignment": {
      "label": "Alignment",
      "desc": "Select the alignment position for lyrics text",
      "options": {
        "left": "Left",
        "center": "Center",
        "right": "Right"
      }
    },
    "noise": {
      "label": "Noise Overlay",
      "desc": "Add film grain effect to the background"
    },
    "colorful": {
      "label": "Colorful Background",
      "desc": "Enable dynamic background based on album colors"
    },
    "gradientBackground": {
      "label": "Album Cover Background",
      "desc": "Use the currently playing album cover as background (may not work properly in fullscreen mode)"
    },
    "solidBackground": {
      "label": "Solid Background",
      "desc": "Use a custom solid color as background"
    },
    "solidBackgroundColor": {
      "label": "Solid Background Color",
      "desc": "Select the color to use for solid background"
    },
    "videoBackground": {
      "label": "Video Background",
      "desc": "Use YouTube video as background (Beta)"
    },
    "videoBlur": {
      "label": "Video Blur",
      "desc": "Adjust blur intensity for video background (0-40px)"
    },
    "videoCover": {
      "label": "Video Cover Fill",
      "desc": "Stretch video to fill the screen (may crop top/bottom or sides)"
    },
    "backgroundBrightness": {
      "label": "Background Brightness",
      "desc": "Adjust background brightness level (0-100%)"
    },
    "solidBackgroundWarning": "Background brightness adjustment does not apply when using solid background.",
    "updateCheck": {
      "label": "Check for Updates",
      "desc": "Automatically check for new updates",
      "info": "Update checks are performed at most once every 24 hours."
    },
    "backgroundOpacity": {
      "label": "Cover Background Opacity",
      "desc": "Set the opacity of the cover background"
    },
    "contentWidth": {
      "label": "Content Width",
      "desc": "Set the width of content in fullscreen and non-fullscreen modes"
    },
    "japaneseConversion": {
      "label": "Japanese Conversion",
      "desc": "Set the conversion format for Japanese lyrics",
      "info": "This setting only applies to synced and unsynced lyrics. It does not work for karaoke lyrics.",
      "options": {
        "disabled": "Disabled",
        "romaji": "Romaji",
        "furigana": "Furigana",
        "hiragana": "Hiragana",
        "katakana": "Katakana"
      }
    },
    "displayContent": {
      "label": "Display Content",
      "desc": "Display lyrics with additional content",
      "options": {
        "disabled": "Disabled",
        "romanization": "Romanization",
        "translation": "Translation"
      }
    },
    "autoTranslation": {
      "label": "Auto Translation",
      "desc": "Automatically provide translation when lyrics don't have one",
      "options": {
        "disabled": "Disabled (Default)",
        "google": "Google Translate",
        "microsoft": "Microsoft Translator"
      }
    },
    "lyricsMode": {
      "label": "Lyrics Mode",
      "options": {
        "karaoke": "Karaoke",
        "synced": "Synced",
        "unsynced": "Unsynced",
        "genius": "Genius"
      }
    },
    "playBarButton": {
      "label": "Playbar Button",
      "desc": "Show lyrics button in the playbar",
      "options": {
        "disabled": "Disabled",
        "normal": "Normal",
        "fullscreen": "Fullscreen"
      }
    },
    "autoScroll": {
      "label": "Auto Scroll",
      "desc": "Enable auto scroll. Returns to auto scroll 5 seconds after manual scrolling."
    },
    "animation": {
      "label": "Animation",
      "desc": "Show animations other than karaoke highlight line"
    },
    "karaoke": {
      "label": "Karaoke Lead Countdown",
      "desc": "Show lead countdown as numbers. When disabled, it shows as dots."
    },
    "blurInactive": {
      "label": "Blur Inactive Lines",
      "desc": "Blur inactive lines in synced lyrics",
      "info": "Performance issues may occur when this option is enabled."
    },
    "fade": {
      "label": "Blur & Gradient",
      "desc": "Show blur and gradient at the top and bottom of lyrics",
      "info": "Performance issues may occur when this option is enabled."
    },
    "syncedAsFallback": {
      "label": "Synced Lyrics Fallback",
      "desc": "Fall back to synced lyrics when karaoke lyrics are not available"
    },
    "unsyncedAsFallback": {
      "label": "Unsynced Lyrics Fallback",
      "desc": "Fall back to unsynced lyrics when synced lyrics are not available"
    },
    "preferUnsynced": {
      "label": "Prefer Unsynced Over Synced",
      "desc": "Prefer unsynced lyrics when both synced and unsynced lyrics are available.",
      "info": "* Some unsynced lyrics may contain lyrics that are not in synced lyrics."
    },
    "customPreview": {
      "label": "Custom Preview",
      "desc": "Customize the lyrics screen preview image. Image is displayed at 300x150px.",
      "placeholder": "Enter image URL"
    },
    "trackSyncInfo": {
      "label": "Track Sync Info",
      "desc": "Manage sync information linked to tracks"
    },
    "customDatabase": {
      "label": "Custom Database",
      "desc": "Set custom database URL",
      "placeholder": "Enter custom database URL"
    },
    "debugVerbose": {
      "label": "Debug Verbose",
      "desc": "Output more detailed information to the console"
    },
    "cache": {
      "deleteAll": "Delete All Cached Lyrics",
      "noCache": "No Cached Lyrics"
    },
    "colors": {
      "customColor": "Custom",
      "showMore": "More ▼",
      "showLess": "Less ▲",
      "black": "Black",
      "charcoal": "Charcoal",
      "darkSlate": "Dark Slate",
      "gray": "Gray",
      "darkNavy": "Dark Navy",
      "navy": "Navy",
      "royalBlue": "Royal Blue",
      "sky": "Sky",
      "indigo": "Indigo",
      "purple": "Purple",
      "fuchsia": "Fuchsia",
      "pink": "Pink",
      "wine": "Wine",
      "red": "Red",
      "orange": "Orange",
      "amber": "Amber",
      "gold": "Gold",
      "lime": "Lime",
      "green": "Green",
      "emerald": "Emerald",
      "teal": "Teal",
      "cyan": "Cyan",
      "brown": "Brown",
      "chocolate": "Chocolate"
    },
    "solidBackgroundInUse": "ℹ️ Solid Background In Use",
    "fontPlaceholder": "Font name (e.g., Arial, Georgia)"
  },
  "providers": {
    "musixmatch": {
      "name": "Musixmatch",
      "desc": "Musixmatch provides the world's largest lyrics catalog."
    },
    "lrclib": {
      "name": "LRCLIB",
      "desc": "LRCLIB provides synced lyrics and is a free community-maintained lyrics database."
    },
    "ivlyrics": {
      "name": "IvLyrics",
      "desc": "IvLyrics provides synced and karaoke lyrics."
    },
    "spotify": {
      "name": "Spotify",
      "desc": "Spotify provides synced lyrics for some premium users."
    },
    "netease": {
      "name": "NetEase",
      "desc": "NetEase (网易云音乐) provides Chinese lyrics."
    },
    "genius": {
      "name": "Genius",
      "desc": "Genius provides lyrics and annotations."
    },
    "custom": {
      "name": "Custom Database",
      "desc": "Fetch lyrics from custom database."
    }
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "reset": "Reset",
    "import": "Import",
    "export": "Export",
    "open": "Open",
    "close": "Close",
    "apply": "Apply",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "remove": "Remove",
    "clear": "Clear",
    "refresh": "Refresh",
    "settings": "Settings",
    "fullscreen": "Fullscreen",
    "exitFullscreen": "Exit Fullscreen"
  },
  "menu": {
    "translation": "Conversion",
    "settings": "Settings",
    "syncAdjust": "Sync Adjust",
    "syncAdjustTitle": "Lyrics Sync Adjustment",
    "copyLyrics": "Copy Lyrics",
    "searchLyrics": "Search Lyrics",
    "editLyrics": "Edit Lyrics",
    "translationOptions": "Conversion Options",
    "translationOptionsSubtitle": "Configure pronunciation and translation display for lyrics",
    "detectedLanguage": "Detected Language",
    "detectedLanguageInfo": "The language of the currently playing track. Conversion options are applied differently based on language.",
    "unknownLanguage": "Unknown",
    "pronunciation": "Pronunciation",
    "pronunciationInfo": "Display romanization of original lyrics",
    "translationLabel": "Translation",
    "translationInfo": "Display translated lyrics",
    "apiSettings": "API Settings",
    "apiSettingsSubtitle": "Configure Gemini API",
    "apiKeySettings": "API Key Settings",
    "apiKeySettingsInfo": "Click here to configure Gemini API key",
    "openSettings": "Open Settings",
    "translationSettings": "Conversion Settings",
    "regenerateTranslation": "Regenerate Translation",
    "fullscreen": "Fullscreen"
  },
  "messages": {
    "noLyrics": "No lyrics available",
    "loading": "Loading...",
    "error": "An error occurred",
    "saved": "Saved",
    "copied": "Copied",
    "deleted": "Deleted",
    "updated": "Updated",
    "applied": "Applied",
    "noTrackInfo": "No track information",
    "syncedLyricsCopied": "Synced lyrics copied to clipboard.",
    "unsyncedLyricsCopied": "Unsynced lyrics copied to clipboard."
  },
  "update": {
    "newVersion": "New update version",
    "available": " is available!",
    "notes": "Update Notes",
    "update": "Update",
    "dismiss": "Later",
    "alreadyLatest": "Already on the latest version",
    "checkFailed": "Failed to check for updates",
    "versionChange": "Version",
    "copyCommand": "Copy Command",
    "releaseNotes": "Release Notes",
    "expand": "More",
    "collapse": "Less",
    "copied": "Copied"
  },
  "fullscreen": {
    "title": "Fullscreen",
    "background": "Background",
    "backgroundOptions": {
      "albumArt": "Album Art",
      "animatedCanvas": "Animated Canvas",
      "artistArt": "Artist Art",
      "staticColor": "Static Color"
    },
    "showExtraControls": {
      "label": "Show Extra Controls",
      "desc": "Show extra controls in fullscreen mode"
    },
    "contextDisplay": {
      "label": "Context Display",
      "desc": "Show currently playing context in fullscreen mode"
    },
    "upcomingLyrics": {
      "label": "Show Upcoming Lyrics",
      "desc": "Preview upcoming lyrics in fullscreen mode"
    },
    "volumeDisplay": {
      "label": "Volume Display",
      "desc": "Show volume control in fullscreen mode"
    },
    "controls": {
      "like": "Like",
      "unlike": "Unlike",
      "shuffle": "Shuffle",
      "previous": "Previous",
      "next": "Next",
      "nextTrackLabel": "Up Next",
      "play": "Play",
      "pause": "Pause",
      "repeatOff": "Repeat Off",
      "repeatAll": "Repeat All",
      "repeatOne": "Repeat One",
      "mute": "Mute",
      "unmute": "Unmute",
      "share": "Copy Share Link",
      "shareCopied": "🔗 Share link copied"
    },
    "contextType": {
      "playlist": "Playlist",
      "album": "Album",
      "artist": "Artist",
      "collection": "Liked Songs",
      "station": "Radio"
    }
  },
  "about": {
    "version": "Version",
    "sourceCode": "Source Code",
    "reportIssue": "Report Issue",
    "changelog": "Changelog",
    "license": "License",
    "credits": "Credits"
  },
  "translationMenu": {
    "none": "None",
    "disabled": "Disabled",
    "romaji": "Romaji",
    "hiragana": "Hiragana",
    "katakana": "Katakana",
    "furigana": "Furigana",
    "romanization": "Romanization",
    "translation": "Translation",
    "google": "Google Translate",
    "microsoft": "Microsoft Translate",
    "geminiRomaji": "Romanization",
    "geminiKo": "Translation",
    "romajiGemini": "Romaji (Gemini)",
    "koGemini": "Korean (Gemini)",
    "simplifiedChinese": "Simplified Chinese",
    "traditionalChineseHK": "Traditional Chinese (HK)",
    "traditionalChineseTW": "Traditional Chinese (TW)",
    "pinyin": "Pinyin"
  },
  "notifications": {
    "languageChanged": "Language changed. Refresh to apply.",
    "settingsSaved": "Settings saved",
    "settingsReset": "Settings reset",
    "exportSuccess": "Export successful",
    "importSuccess": "Import successful",
    "importFailed": "Settings import failed",
    "syncDataCleared": "Sync data cleared",
    "syncDataClearFailed": "Failed to clear sync data",
    "lyricsCopied": "✓ Lyrics copied to clipboard",
    "lyricsCopyFailed": "Failed to copy lyrics to clipboard",
    "translationCopyFailed": "Failed to copy translation to clipboard",
    "secondTranslationCopyFailed": "Failed to copy second translation to clipboard",
    "installCommandCopied": "Install command copied",
    "copyFailed": "Copy failed",
    "memoryCacheCleared": "✓ Memory cache cleared",
    "localCacheCleared": "✓ All local cache cleared",
    "localCacheTrackCleared": "✓ Current track cache cleared",
    "exportSuccessDesc": "Settings file saved to Downloads folder.",
    "exportFailed": "Settings export failed",
    "importSuccessDesc": "Page will refresh shortly...",
    "resetSuccess": "Reset complete",
    "resetSuccessDesc": "Page will refresh shortly...",
    "resetFailed": "Reset failed",
    "updateCheckFailed": "Update check failed",
    "checkNetworkConnection": "Check your network connection",
    "updateAvailable": "Update available",
    "latestVersion": "You're on the latest version",
    "noLyricsLoaded": "No lyrics loaded.",
    "translationRegenerateGeminiOnly": "Translation regeneration is only available with Gemini translation.",
    "regeneratingTranslation": "Regenerating translation...",
    "translationRegenerated": "✓ Translation regenerated",
    "translationRegenerateFailed": "Translation regeneration failed",
    "translationCacheRemoved": "✓ Translation cache removed and reloaded!",
    "tooManyTranslationRequests": "Too many translation requests. Please try again in 1 minute.",
    "requestingPronunciation": "Requesting pronunciation. This may take about 30 seconds",
    "requestingTranslation": "Requesting translation. This may take about 30 seconds"
  },
  "misc": {
    "and": "and",
    "or": "or",
    "enabled": "Enabled",
    "disabled": "Disabled",
    "default": "Default",
    "custom": "Custom",
    "none": "None",
    "auto": "Auto",
    "manual": "Manual",
    "on": "On",
    "off": "Off",
    "yes": "Yes",
    "no": "No",
    "items": "items",
    "seconds": "seconds",
    "minutes": "minutes"
  },
  "settingsAdvanced": {
    "patchNotes": {
      "empty": "No patch notes available."
    },
    "donate": {
      "title": "Buy the developer a coffee",
      "button": "Donate"
    },
    "syncMode": {
      "title": "Sync Mode",
      "subtitle": "Display options for compact sync mode",
      "linesBefore": {
        "label": "Lines Before",
        "desc": "Number of lines to display before the current lyrics"
      },
      "linesAfter": {
        "label": "Lines After",
        "desc": "Number of lines to display after the current lyrics"
      },
      "fadeoutBlur": {
        "label": "Fadeout Blur Effect",
        "desc": "Apply blur effect to inactive lyrics"
      },
      "highlightMode": {
        "label": "Highlight Mode",
        "desc": "Emphasize only the current lyrics and dim the rest"
      },
      "highlightIntensity": {
        "label": "Highlight Intensity",
        "desc": "Adjust the opacity of inactive lyrics (lower is dimmer)"
      }
    },
    "livePreview": {
      "title": "Live Preview",
      "subtitle": "Instantly see your style settings",
      "sampleText": "Lyric is here",
      "sampleTextMixed": "여기 Lyric あります",
      "sampleTextPhonetic": "yeogi lyric arimasu"
    },
    "originalStyle": {
      "title": "Original Style",
      "subtitle": "Font settings for original lyrics",
      "fontFamily": "Font Family",
      "fontFamilyDesc": "Select the font to apply to original lyrics. Separate multiple fonts with commas (,) to apply in order.",
      "fontSize": {
        "label": "Font Size",
        "desc": "Font size for original lyrics (pixels)"
      },
      "fontWeight": {
        "label": "Font Weight",
        "desc": "Font weight for original lyrics"
      },
      "opacity": {
        "label": "Opacity",
        "desc": "Opacity of original lyrics (0-100%)"
      },
      "letterSpacing": {
        "label": "Letter Spacing",
        "desc": "Spacing between letters in original lyrics (pixels)"
      }
    },
    "pronunciationStyle": {
      "title": "Pronunciation Style",
      "subtitle": "Font settings for romanization (Romaji, Romaja, Pinyin)",
      "fontFamily": "Font Family",
      "fontFamilyDesc": "Select the font to apply to romanization. Separate multiple fonts with commas (,) to apply in order.",
      "fontSize": {
        "label": "Font Size",
        "desc": "Font size for romanization (pixels)"
      },
      "fontWeight": {
        "label": "Font Weight",
        "desc": "Font weight for romanization"
      },
      "opacity": {
        "label": "Opacity",
        "desc": "Opacity of romanization (0-100%)"
      },
      "gap": {
        "label": "Gap from Original",
        "desc": "Spacing between original lyrics and romanization"
      },
      "letterSpacing": {
        "label": "Letter Spacing",
        "desc": "Spacing between letters in romanization (pixels)"
      },
      "hyphenReplace": {
        "label": "Hyphen (-) Processing",
        "desc": "Choose how to display hyphens in pronunciation (e.g., Tah-shee-kah → Tah shee kah or Tahsheekah)",
        "options": {
          "keep": "Keep (Tah-shee-kah)",
          "space": "Replace with space (Tah shee kah)",
          "remove": "Remove (Tahsheekah)"
        }
      }
    },
    "translationStyle": {
      "title": "Translation Style",
      "subtitle": "Font settings for translated lyrics",
      "fontFamily": "Font Family",
      "fontFamilyDesc": "Select the font to apply to translated lyrics. Separate multiple fonts with commas (,) to apply in order.",
      "fontSize": {
        "label": "Font Size",
        "desc": "Font size for translated lyrics (pixels)"
      },
      "fontWeight": {
        "label": "Font Weight",
        "desc": "Font weight for translated lyrics"
      },
      "opacity": {
        "label": "Opacity",
        "desc": "Opacity of translated lyrics (0-100%)"
      },
      "gap": {
        "label": "Gap from Pronunciation",
        "desc": "Spacing between romanization and translation (pixels)"
      },
      "letterSpacing": {
        "label": "Letter Spacing",
        "desc": "Spacing between letters in translation (pixels)"
      }
    },
    "textShadow": {
      "title": "Text Shadow",
      "subtitle": "Shadow effects for better readability",
      "enabled": {
        "label": "Shadow Effect",
        "desc": "Apply shadow effect to lyrics text"
      },
      "color": {
        "label": "Shadow Color",
        "desc": "Color of the shadow (HEX code)"
      },
      "opacity": {
        "label": "Shadow Opacity",
        "desc": "Opacity of the shadow (0-100%)"
      },
      "blur": {
        "label": "Blur Intensity",
        "desc": "Blur amount for the shadow"
      }
    },
    "playback": {
      "title": "Playback Behavior",
      "subtitle": "Playback-related feature settings",
      "replaceButton": {
        "label": "Replace Lyrics Button",
        "info": "Replaces Spotify's default lyrics button with Lyrics Plus"
      },
      "fullscreenShortcut": {
        "label": "Fullscreen Shortcut",
        "desc": "Keyboard shortcut for lyrics fullscreen mode"
      }
    },
    "karaokeMode": {
      "title": "Karaoke Mode",
      "subtitle": "Karaoke-style lyrics display",
      "enabled": {
        "label": "Enable Karaoke Mode",
        "desc": "Use karaoke tab for songs that support karaoke lyrics. When disabled, synced tab is used instead"
      },
      "bounce": {
        "label": "Character Bounce Effect",
        "desc": "Apply bouncing animation to the current character in karaoke mode"
      }
    },
    "prefetch": {
      "title": "Prefetch Next Track",
      "subtitle": "Preload elements for the next track to reduce transition delays",
      "enabled": {
        "label": "Prefetch Translation/Phonetic",
        "desc": "Preload translation and phonetic conversion for the next track"
      },
      "videoEnabled": {
        "label": "Prefetch Video Background",
        "desc": "Preload video background information for the next track"
      }
    },
    "communitySync": {
      "title": "Community Sync",
      "subtitle": "Share lyrics sync offsets with other users",
      "enabled": {
        "label": "Use Community Sync",
        "desc": "Use sync offsets shared by the community"
      },
      "autoApply": {
        "label": "Auto Apply",
        "desc": "Automatically apply community offset when confidence is sufficient"
      },
      "autoSubmit": {
        "label": "Auto Submit",
        "desc": "Automatically share your sync offset changes with the community"
      },
      "minConfidence": {
        "label": "Minimum Confidence",
        "desc": "Minimum confidence required for auto-apply (0.0 ~ 1.0). Confidence is calculated based on number of submissions and consistency of offset values. Higher values mean more users submitted similar offsets"
      }
    },
    "cacheManagement": {
      "title": "Cache Management",
      "subtitle": "Manage stored data",
      "memoryCache": {
        "label": "Clear Memory Cache",
        "desc": "Loaded lyrics are temporarily stored in memory for quick reload. Clear memory cache without restarting Spotify",
        "button": "Clear Cache"
      },
      "localCache": {
        "label": "Local Cache Management (IndexedDB)",
        "desc": "Lyrics, translations, and phonetics are stored locally to reduce API calls on repeated plays",
        "clearAll": "Clear All",
        "clearCurrent": "Clear Current Track",
        "stats": "Lyrics: {lyrics}, Translations: {translations}, Metadata: {metadata}"
      }
    },
    "lyricsProviders": {
      "title": "Lyrics Providers",
      "subtitle": "Manage priority and settings of lyrics sources"
    },
    "languageDetection": {
      "title": "Language Detection",
      "subtitle": "Language detection settings for text conversion",
      "furigana": {
        "label": "Show Furigana for Japanese Kanji",
        "desc": "Display hiragana readings above kanji in Japanese lyrics"
      },
      "japaneseThreshold": {
        "label": "Japanese Detection Threshold",
        "desc": "Detect Japanese by the ratio of kana characters in lyrics. Higher values are stricter (percentage)"
      },
      "chineseThreshold": {
        "label": "Chinese Detection Threshold",
        "desc": "Detect Chinese type by the ratio of traditional and simplified characters. Higher values are stricter (percentage)"
      }
    },
    "apiKeys": {
      "subtitle": "API keys for external service integration"
    },
    "exportImport": {
      "title": "Export/Import Settings",
      "subtitle": "Transfer settings to another device",
      "export": {
        "label": "Export Settings",
        "button": "Export",
        "processing": "Exporting..."
      },
      "import": {
        "label": "Import Settings",
        "button": "Import",
        "processing": "Importing..."
      }
    },
    "resetSettings": {
      "title": "Reset Settings",
      "subtitle": "Restore all settings to default values",
      "reset": {
        "label": "Reset All Settings",
        "desc": "Restore all settings to default values. This action cannot be undone",
        "button": "Reset",
        "confirm": "Are you sure you want to reset all settings?\n\nThis action cannot be undone, and all settings will be reset to default values.\n\nClick 'OK' to continue.",
        "processing": "Resetting..."
      }
    },
    "fullscreenMode": {
      "title": "Fullscreen Mode",
      "subtitle": "Layout and display settings for fullscreen mode",
      "shortcut": {
        "desc": "Fullscreen Shortcut",
        "info": "Set keyboard shortcut to toggle fullscreen mode"
      },
      "splitView": {
        "desc": "Split Layout",
        "info": "Display album art on left, lyrics on right in fullscreen"
      },
      "invertPosition": {
        "desc": "Invert Album/Lyrics Position",
        "info": "Swap positions of album and lyrics (left↔right, or top↔bottom in portrait)"
      },
      "showAlbumArt": {
        "desc": "Show Album Art",
        "info": "Display album art in the left panel of fullscreen"
      },
      "showTrackInfo": {
        "desc": "Show Track Info",
        "info": "Display song title and artist in fullscreen"
      },
      "translateMetadata": {
        "desc": "Translate Title/Artist",
        "info": "Translate foreign song titles and artist names (requires Gemini API key)"
      },
      "translateMetadataMode": {
        "desc": "Display Mode",
        "info": "Choose how to display the title and artist",
        "options": {
          "translated": "Translation Only",
          "romanized": "Romanization Only",
          "originalTranslated": "Original + Translation",
          "originalRomanized": "Original + Romanization",
          "all": "Show All"
        }
      },
      "infoGap": {
        "desc": "Album Art Gap",
        "info": "Adjust the gap between album art and controls (pixels)"
      },
      "centerWhenNoLyrics": {
        "desc": "Center Album When No Lyrics",
        "info": "Center album art when lyrics are unavailable or loading"
      },
      "twoColumnLayout": {
        "desc": "Use Two-Column Layout"
      },
      "browserFullscreen": {
        "desc": "Use Spotify Fullscreen",
        "info": "Enter Spotify fullscreen when entering fullscreen mode to fill the entire monitor"
      }
    },
    "fullscreenStyle": {
      "title": "Fullscreen Style",
      "subtitle": "Visual element settings for fullscreen mode",
      "albumSize": {
        "desc": "Album Art Size",
        "info": "Set maximum size of album art in fullscreen (100-500px)"
      },
      "albumRadius": {
        "desc": "Album Art Roundness",
        "info": "Set corner radius of album art (0-50px)"
      },
      "titleFontSize": {
        "desc": "Title Font Size",
        "info": "Set font size for song title in fullscreen (24-72px)"
      },
      "artistFontSize": {
        "desc": "Artist Font Size",
        "info": "Set font size for artist name in fullscreen (14-36px)"
      },
      "lyricsRightMargin": {
        "desc": "Lyrics Right Margin",
        "info": "Set right margin for lyrics area in fullscreen. Prevents lyrics from appearing off-center (0-300px)"
      }
    },
    "fullscreenUI": {
      "title": "Fullscreen UI Elements",
      "subtitle": "Configure additional UI elements shown in fullscreen",
      "showClock": {
        "desc": "Show Clock",
        "info": "Display current time in upper right corner"
      },
      "clockSize": {
        "desc": "Clock Size",
        "info": "Set size of clock text (24-72px)"
      },
      "showContext": {
        "desc": "Show Playback Context",
        "info": "Display currently playing playlist/album info in lower left"
      },
      "showContextImage": {
        "desc": "Show Context Image",
        "info": "Display playlist/album thumbnail image"
      },
      "showNextTrack": {
        "desc": "Next Track Preview",
        "info": "Display next track info before song ends (broadcast style)"
      },
      "nextTrackTime": {
        "desc": "Next Track Display Time",
        "info": "Set how many seconds before song end to show next track (5-30s)",
        "unit": "seconds"
      },
      "showControls": {
        "desc": "Show Player Controls",
        "info": "Display play/pause, previous/next, shuffle, repeat, like buttons"
      },
      "showVolume": {
        "desc": "Show Volume Control",
        "info": "Display volume slider in player controls"
      },
      "showProgressBar": {
        "desc": "Show Progress Bar",
        "info": "Display progress bar showing current position and total duration"
      },
      "showLyricsProgress": {
        "desc": "Show Lyrics Progress",
        "info": "Display current lyrics line number and total line count"
      }
    },
    "controllerStyle": {
      "title": "Controller Style",
      "subtitle": "Configure player controller appearance",
      "buttonSize": {
        "desc": "Control Button Size",
        "info": "Set size of play, previous/next buttons (28-48px)"
      },
      "background": {
        "desc": "Controller Background",
        "info": "Add translucent background to controller"
      }
    },
    "autoHide": {
      "title": "Auto Hide",
      "subtitle": "Auto-hide UI when mouse is inactive",
      "enabled": {
        "info": "Controller and info will auto-hide when mouse is not moving",
        "desc": "Auto-hide UI"
      },
      "delay": {
        "desc": "Auto Hide Delay",
        "info": "Time before UI hides after mouse inactivity (1-10 seconds)"
      }
    },
    "aboutTab": {
      "appInfo": {
        "title": "App Info"
      },
      "developer": "Developer:",
      "originalProject": "Original Project:",
      "thanks": "Thanks to all contributors to the open source project.",
      "clientInfo": {
        "title": "Client Info",
        "subtitle": "Unique identifier for this client",
        "description": "This is an automatically generated unique identifier for account linking. This value cannot be modified and is uniquely assigned to each client. Be careful not to expose this value.",
        "copied": "Client ID copied",
        "copyFailed": "Copy failed",
        "copy": "Copy"
      },
      "update": {
        "title": "Update",
        "subtitle": "Check for latest version",
        "checkUpdate": {
          "desc": "Check Latest Version",
          "button": "Check Update",
          "checking": "Checking..."
        },
        "copied": "Copied",
        "installCopied": "Install command copied",
        "copyFailed": "Copy failed"
      },
      "patchNotes": {
        "title": "Patch Notes",
        "subtitle": "Latest update history",
        "loading": "Loading patch notes..."
      },
      "subtitle": "About Lyrics Plus",
      "appDescription": "A Korean-supported lyrics extension for Spicetify.",
      "versionPrefix": "Version",
      "viewOnGithub": "View on GitHub",
      "patchNotesLoadFailed": "Failed to load patch notes",
      "checkGithubReleases": "Please check the GitHub releases page",
      "visitGithub": "Visit GitHub Repository",
      "joinDiscord": "Join Discord Server"
    },
    "debugTab": {
      "title": "Debug Information",
      "subtitle": "Information to share with developers when reporting bugs",
      "currentTrack": "Current Track Info",
      "trackInfo": "Track Info",
      "lyricsInfo": "Lyrics Info",
      "settingsInfo": "Settings Info",
      "noLyrics": "No lyrics information",
      "loading": "Loading info...",
      "refresh": "Refresh",
      "copyToClipboard": "Copy to Clipboard",
      "copied": "Copied!",
      "copyFailed": "Failed to copy",
      "sendToDiscord": "Report to Discord",
      "rawJson": "JSON Data"
    },
    "api": {
      "title": "API Settings",
      "getApiKey": {
        "desc": "Get API Key",
        "info": "You can get a free Gemini API key from Google AI Studio",
        "button": "Open API Key Page"
      },
      "geminiKey": {
        "desc": "Gemini API Key",
        "info": "API key is required to use lyrics translation feature powered by Google Gemini AI"
      }
    },
    "update": {
      "title": "Update",
      "subtitle": "Check for latest version",
      "checkUpdate": {
        "desc": "Check Latest Version",
        "button": "Check Update",
        "checking": "Checking..."
      },
      "copied": "Copied",
      "installCopied": "Install command copied",
      "copyFailed": "Copy failed",
      "currentVersionInfo": "Current version: v{version}. Check for new updates on GitHub",
      "checkFailedWithError": "Update check failed: {error}"
    }
  },
  "syncAdjust": {
    "info": "Move the slider to the right to make the lyrics faster.",
    "reset": "Reset",
    "communityTitle": "Community Sync",
    "communityOffset": "Offset",
    "submissions": "Submissions",
    "confidenceHigh": "High Confidence",
    "confidenceMedium": "Medium Confidence",
    "confidenceLow": "Low Confidence",
    "applyCommunity": "Apply",
    "submitMine": "Submit My Offset",
    "submitting": "Submitting...",
    "submitSuccess": "Submitted to community",
    "submitFailed": "Failed to submit",
    "noData": "No community data available",
    "loading": "Loading...",
    "feedbackGood": "Offset is accurate",
    "feedbackBad": "Offset is inaccurate",
    "cannotFeedbackOwnSubmission": "You cannot rate your own submission",
    "feedbackPositiveSuccess": "Thanks for the positive feedback!",
    "feedbackNegativeSuccess": "Thanks for your feedback. We'll improve!",
    "feedbackFailed": "Failed to submit feedback",
    "autoSubmitEnabled": "⚡ Auto-submit is enabled"
  },
  "playbarButton": {
    "label": "Lyrics Plus"
  },
  "videoBackground": {
    "loading": "Loading video info...",
    "notFound": "Video not found.",
    "error": "An error occurred.",
    "loadingMessage": "Loading video background... This may take about 30 seconds."
  },
  "translator": {
    "missingApiKey": "Gemini API key is not set. Please enter an API key in settings.",
    "invalidApiKeyFormat": "Invalid API key format. Gemini API key must start with 'AIza'.",
    "invalidRequestFormat": "Invalid request format. Please check your API key.",
    "invalidApiKey": "Invalid API key. Please check your Gemini API key in settings.",
    "accessForbidden": "API access forbidden. Please check your API key permissions.",
    "rateLimitExceeded": "Rate limit exceeded. Please try again later.",
    "serviceUnavailable": "Translation service temporarily unavailable. Please try again later.",
    "requestFailed": "API request failed",
    "apiKeyError": "Gemini API key error occurred. Please check your API key in settings.",
    "translationFailed": "Translation failed",
    "requestTimeout": "Translation request timed out. Please try again.",
    "failedPrefix": "Translation failed"
  },
  "utils": {
    "allUrlsFailed": "Failed to fetch version info from all URLs",
    "invalidVersionFormat": "Invalid version format",
    "unknownError": "Unknown error",
    "requestTimeout": "Request timeout",
    "networkError": "Network connection failed",
    "securityRestriction": "Browser security policy restriction",
    "serverError": "Server response error",
    "terminalMac": "Terminal"
  },
  "providerDescriptions": {
    "lrclib": "Lyrics from lrclib.net. Supports both synced and unsynced lyrics. LRCLIB is a free open-source lyrics provider.",
    "ivLyrics": "Lyrics from ivLyrics API. Supports synced lyrics, unsynced lyrics, and word-by-word karaoke lyrics.",
    "spotify": "Lyrics from official Spotify API.",
    "cache": "Lyrics from cached/local files loaded from previous Spotify sessions."
  },
  "modes": {
    "karaoke": "Karaoke",
    "synced": "Synced",
    "unsynced": "Unsynced"
  },
  "communityVideo": {
    "title": "Community Video Recommendations",
    "loading": "Loading videos...",
    "loadError": "Failed to load videos",
    "noVideos": "No community videos yet",
    "autoDetected": "Auto",
    "startTime": "Start",
    "submittedBy": "By",
    "addVideo": "Add Video",
    "addVideoNoEmoji": "Add Video",
    "youtubeUrl": "YouTube URL",
    "startTimeSeconds": "Start Time (seconds)",
    "submit": "Submit",
    "submitting": "Submitting...",
    "submitted": "Video submitted successfully!",
    "updated": "Video updated successfully!",
    "submitError": "Failed to submit video",
    "invalidUrl": "Invalid YouTube URL",
    "videoNotFound": "YouTube video not found",
    "videoPrivate": "Video is private or deleted",
    "validationError": "Could not validate video. Please try again",
    "selectVideo": "Select Video",
    "preview": "Preview",
    "apply": "Apply",
    "applyShort": "Apply",
    "applied": "Video applied",
    "videoTitle": "Video Title",
    "loadingTitle": "Loading title...",
    "startTimeLabel": "First Lyric Start Time (seconds)",
    "startTimeHint": "Enter the time when the first lyric starts in the YouTube video",
    "delete": "Delete",
    "deleteConfirm": "Are you sure you want to delete this video?",
    "deleted": "Video deleted successfully",
    "deleteError": "Failed to delete video"
  },
  "close": "Close",
  "cancel": "Cancel"
};
