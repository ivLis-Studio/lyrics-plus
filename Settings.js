const ButtonSVG = react.memo(
  ({ icon, active = true, onClick }) => {
    return react.createElement(
      "button",
      {
        className: `switch-checkbox${active ? " active" : ""}`,
        onClick,
        "aria-checked": active,
        role: "checkbox",
      },
      react.createElement("svg", {
        width: 12,
        height: 12,
        viewBox: "0 0 16 16",
        fill: "currentColor",
        dangerouslySetInnerHTML: {
          __html: icon,
        },
      })
    );
  },
  (prevProps, nextProps) => {
    // active 상태가 변경되면 리렌더링 필요
    return prevProps.active === nextProps.active;
  }
);

const SwapButton = ({ icon, disabled, onClick }) => {
  return react.createElement(
    "button",
    {
      className: "swap-button",
      onClick,
      disabled,
    },
    react.createElement("svg", {
      width: 12,
      height: 12,
      viewBox: "0 0 16 16",
      fill: "currentColor",
      dangerouslySetInnerHTML: {
        __html: icon,
      },
    })
  );
};

const CacheButton = () => {
  let lyrics = {};

  try {
    const localLyrics = JSON.parse(
      StorageManager.getItem("lyrics-plus:local-lyrics")
    );
    if (!localLyrics || typeof localLyrics !== "object") {
      throw "";
    }
    lyrics = localLyrics;
  } catch {
    lyrics = {};
  }

  const [count, setCount] = useState(Object.keys(lyrics).length);
  const text = count ? I18n.t("settings.cache.deleteAll") : I18n.t("settings.cache.noCache");

  return react.createElement(
    "button",
    {
      className: "btn",
      onClick: () => {
        StorageManager.setItem("lyrics-plus:local-lyrics");
        setCount(0);
      },
      disabled: !count,
    },
    text
  );
};

const ConfigButton = ({ name, info, text, onChange = () => { } }) => {
  return react.createElement(
    "div",
    {
      className: "setting-row",
    },
    react.createElement(
      "div",
      { className: "setting-row-content" },
      react.createElement(
        "div",
        { className: "setting-row-left" },
        react.createElement("div", { className: "setting-name" }, name),
        info &&
        react.createElement("div", {
          className: "setting-description",
          dangerouslySetInnerHTML: {
            __html: info,
          },
        })
      ),
      react.createElement(
        "div",
        { className: "setting-row-right" },
        react.createElement(
          "button",
          {
            className: "btn",
            onClick: onChange,
          },
          text
        )
      )
    )
  );
};

const ConfigSlider = react.memo(
  ({ name, defaultValue, disabled, onChange = () => { } }) => {
    const [active, setActive] = useState(defaultValue);

    useEffect(() => {
      setActive(defaultValue);
    }, [defaultValue]);

    const toggleState = useCallback(() => {
      if (disabled) return;
      setActive((prevActive) => {
        const newState = !prevActive;
        onChange(newState);
        return newState;
      });
    }, [onChange, disabled]);

    return react.createElement(ButtonSVG, {
      icon: Spicetify.SVGIcons.check,
      active,
      onClick: toggleState,
      disabled,
    });
  }
);

const ConfigSliderRange = ({
  name,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  disabled,
  onChange = () => { },
}) => {
  const [value, setValue] = useState(defaultValue);
  const sliderRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const updateValue = useCallback(
    (newValue) => {
      if (disabled) return;
      setValue(newValue);
      onChange(newValue);
    },
    [onChange, disabled]
  );

  const handleInput = useCallback(
    (event) => {
      const newValue = Number(event.target.value);
      updateValue(newValue);
    },
    [updateValue]
  );

  const handleChange = useCallback(
    (event) => {
      const newValue = Number(event.target.value);
      updateValue(newValue);
    },
    [updateValue]
  );

  const sliderStyle = {
    "--progress-percent": `${((value - min) / (max - min)) * 100}%`,
  };

  return react.createElement(
    "div",
    { className: `slider-container` },
    react.createElement("input", {
      ref: sliderRef,
      type: "range",
      min,
      max,
      step,
      value,
      disabled,
      onInput: handleInput,
      onChange: handleChange,
      onMouseDown: (e) => {
        if (disabled) return;
        // 마우스 다운 시 즉시 값 업데이트
        const newValue = Number(e.target.value);
        updateValue(newValue);
      },
      className: "config-slider",
      style: sliderStyle,
    }),
    react.createElement(
      "span",
      { className: "slider-value" },
      `${value}${unit}`
    )
  );
};

const ConfigColorPicker = ({ name, defaultValue, onChange = () => { } }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = useCallback(
    (event) => {
      const newValue = event.target.value;
      setValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  return react.createElement(
    "div",
    { className: "color-picker-container" },
    react.createElement("input", {
      type: "color",
      value,
      onChange: handleChange,
      className: "config-color-picker",
    }),
    react.createElement("input", {
      type: "text",
      value,
      onChange: handleChange,
      className: "config-color-input",
      pattern: "^#[0-9A-Fa-f]{6}$",
      placeholder: "#000000",
    })
  );
};

const ColorPresetSelector = ({ name, defaultValue, onChange = () => { } }) => {
  const [selectedColor, setSelectedColor] = useState(defaultValue);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setSelectedColor(defaultValue);
  }, [defaultValue]);

  // 엄선된 인기 색상 (24개)
  const colorPresets = [
    { name: I18n.t("settings.colors.black"), color: "#000000" },
    { name: I18n.t("settings.colors.charcoal"), color: "#1a1a1a" },
    { name: I18n.t("settings.colors.darkSlate"), color: "#334155" },
    { name: I18n.t("settings.colors.gray"), color: "#64748b" },

    { name: I18n.t("settings.colors.darkNavy"), color: "#0f172a" },
    { name: I18n.t("settings.colors.navy"), color: "#1e3a8a" },
    { name: I18n.t("settings.colors.royalBlue"), color: "#2563eb" },
    { name: I18n.t("settings.colors.sky"), color: "#0ea5e9" },

    { name: I18n.t("settings.colors.indigo"), color: "#4f46e5" },
    { name: I18n.t("settings.colors.purple"), color: "#8b5cf6" },
    { name: I18n.t("settings.colors.fuchsia"), color: "#d946ef" },
    { name: I18n.t("settings.colors.pink"), color: "#ec4899" },

    { name: I18n.t("settings.colors.wine"), color: "#7f1d1d" },
    { name: I18n.t("settings.colors.red"), color: "#dc2626" },
    { name: I18n.t("settings.colors.orange"), color: "#f97316" },
    { name: I18n.t("settings.colors.amber"), color: "#f59e0b" },

    { name: I18n.t("settings.colors.gold"), color: "#ca8a04" },
    { name: I18n.t("settings.colors.lime"), color: "#84cc16" },
    { name: I18n.t("settings.colors.green"), color: "#22c55e" },
    { name: I18n.t("settings.colors.emerald"), color: "#10b981" },

    { name: I18n.t("settings.colors.teal"), color: "#14b8a6" },
    { name: I18n.t("settings.colors.cyan"), color: "#06b6d4" },
    { name: I18n.t("settings.colors.brown"), color: "#92400e" },
    { name: I18n.t("settings.colors.chocolate"), color: "#78350f" },
  ];

  const handleColorClick = (color) => {
    setSelectedColor(color);
    onChange(color);
  };

  // 현재 선택된 색상 찾기
  const selectedPreset = colorPresets.find((p) => p.color === selectedColor);

  return react.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "300px",
      },
    },
    // 현재 선택된 색상 표시
    react.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "8px 12px",
          backgroundColor: "var(--spice-button)",
          borderRadius: "8px",
          border: "1px solid var(--spice-button)",
          width: "100%",
        },
      },
      react.createElement("div", {
        style: {
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          backgroundColor: selectedColor,
          border: "2px solid var(--spice-text)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          flexShrink: "0",
        },
      }),
      react.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            flex: "1",
            minWidth: "0",
            overflow: "hidden",
          },
        },
        react.createElement(
          "span",
          {
            style: {
              color: "var(--spice-text)",
              fontSize: "13px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
          selectedPreset ? selectedPreset.name : I18n.t("settings.colors.customColor")
        ),
        react.createElement(
          "span",
          {
            style: {
              color: "var(--spice-subtext)",
              fontSize: "11px",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
            },
          },
          selectedColor.toUpperCase()
        )
      ),
      react.createElement(
        "button",
        {
          onClick: () => setShowAll(!showAll),
          style: {
            padding: "6px 12px",
            backgroundColor: "transparent",
            color: "var(--spice-text)",
            border: "1px solid var(--spice-text)",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            flexShrink: "0",
            whiteSpace: "nowrap",
          },
          onMouseEnter: (e) => {
            e.target.style.backgroundColor = "var(--spice-text)";
            e.target.style.color = "var(--spice-card)";
          },
          onMouseLeave: (e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "var(--spice-text)";
          },
        },
        showAll ? I18n.t("settings.colors.showLess") : I18n.t("settings.colors.showMore")
      )
    ),
    // 색상 팔레트
    showAll &&
    react.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "6px",
          padding: "12px",
          backgroundColor: "rgba(var(--spice-rgb-button), 0.3)",
          borderRadius: "8px",
          border: "1px solid var(--spice-button)",
        },
      },
      ...colorPresets.map((preset, index) =>
        react.createElement("button", {
          key: index,
          onClick: () => handleColorClick(preset.color),
          title: preset.name,
          "aria-label": preset.name,
          style: {
            width: "100%",
            aspectRatio: "1",
            borderRadius: "6px",
            backgroundColor: preset.color,
            border:
              selectedColor === preset.color
                ? "2.5px solid var(--spice-text)"
                : "1.5px solid rgba(0,0,0,0.2)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            outline: "none",
            boxShadow:
              selectedColor === preset.color
                ? "0 0 0 3px rgba(var(--spice-rgb-text), 0.2), 0 2px 4px rgba(0,0,0,0.2)"
                : "0 1px 2px rgba(0,0,0,0.1)",
          },
          onMouseEnter: (e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          },
          onMouseLeave: (e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow =
              selectedColor === preset.color
                ? "0 0 0 3px rgba(var(--spice-rgb-text), 0.2), 0 2px 4px rgba(0,0,0,0.2)"
                : "0 1px 2px rgba(0,0,0,0.1)";
          },
        })
      )
    )
  );
};

const ConfigWarning = ({ message }) => {
  return react.createElement(
    "div",
    {
      className: "setting-row",
      style: {
        backgroundColor: "rgba(var(--spice-rgb-warning), 0.25)",
      },
    },
    react.createElement(
      "div",
      { className: "setting-row-content" },
      react.createElement(
        "div",
        { className: "setting-row-left" },
        react.createElement(
          "div",
          {
            className: "setting-name",
            style: { color: "var(--spice-text)", fontWeight: "600" },
          },
          I18n.t("settings.solidBackgroundInUse")
        ),
        react.createElement(
          "div",
          {
            className: "setting-description",
            style: { color: "var(--spice-subtext)" },
          },
          message
        )
      )
    )
  );
};

const ConfigSelection = ({
  name,
  defaultValue,
  options,
  disabled,
  onChange = () => { },
}) => {
  const [value, setValue] = useState(defaultValue);

  const setValueCallback = useCallback(
    (event) => {
      if (disabled) return;
      let value = event.target.value;
      if (!Number.isNaN(Number(value))) {
        value = Number.parseInt(value);
      }
      setValue(value);
      onChange(value);
    },
    [value, options, disabled]
  );

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  if (!Object.keys(options).length) return null;

  return react.createElement(
    "select",
    {
      value,
      disabled,
      onChange: setValueCallback,
    },
    ...Object.keys(options).map((item) =>
      react.createElement(
        "option",
        {
          key: item,
          value: item,
        },
        options[item]
      )
    )
  );
};

const ConfigInput = ({ name, defaultValue, onChange = () => { } }) => {
  const [value, setValue] = useState(defaultValue);

  const setValueCallback = useCallback(
    (event) => {
      const value = event.target.value;
      setValue(value);
      onChange(value);
    },
    [value]
  );

  return react.createElement(
    "div",
    {
      className: "setting-row",
    },
    react.createElement(
      "div",
      { className: "setting-row-content" },
      react.createElement(
        "div",
        { className: "setting-row-left" },
        react.createElement("div", { className: "setting-name" }, name)
      ),
      react.createElement(
        "div",
        { className: "setting-row-right" },
        react.createElement("input", {
          type: "text",
          value,
          onChange: setValueCallback,
        })
      )
    )
  );
};

// Google Fonts 목록 (한글 + 인기 라틴 폰트)
const GOOGLE_FONTS = [
  "Pretendard Variable",
  "Noto Sans KR",
  "Nanum Gothic",
  "Nanum Myeongjo",
  "Black Han Sans",
  "Do Hyeon",
  "Jua",
  "Nanum Gothic Coding",
  "Gowun Batang",
  "Gowun Dodum",
  "IBM Plex Sans KR",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Inter",
  "Raleway",
  "Oswald",
  "Merriweather",
  "Playfair Display",
];

const ConfigFontSelector = ({
  name,
  info,
  defaultValue,
  onChange = () => { },
}) => {
  const [useCustomFont, setUseCustomFont] = useState(() => {
    // 기본값이 Google Fonts 목록에 없으면 커스텀 폰트 사용 중
    return defaultValue && !GOOGLE_FONTS.includes(defaultValue);
  });
  const [selectedFont, setSelectedFont] = useState(() => {
    if (defaultValue && GOOGLE_FONTS.includes(defaultValue)) {
      return defaultValue;
    }
    return "Pretendard Variable";
  });
  const [customFont, setCustomFont] = useState(() => {
    if (defaultValue && !GOOGLE_FONTS.includes(defaultValue)) {
      return defaultValue;
    }
    return "";
  });

  useEffect(() => {
    const isCustom = defaultValue && !GOOGLE_FONTS.includes(defaultValue);
    setUseCustomFont(isCustom);
    if (isCustom) {
      setCustomFont(defaultValue);
    } else if (defaultValue) {
      setSelectedFont(defaultValue);
    }
  }, [defaultValue]);

  const handleFontChange = (event) => {
    const font = event.target.value;
    setSelectedFont(font);
    if (!useCustomFont) {
      onChange(font);
    }
  };

  const handleCustomFontChange = (event) => {
    const font = event.target.value;
    setCustomFont(font);
    if (useCustomFont) {
      onChange(font);
    }
  };

  const handleCheckboxChange = () => {
    const newUseCustom = !useCustomFont;
    setUseCustomFont(newUseCustom);
    if (newUseCustom) {
      onChange(customFont || "");
    } else {
      onChange(selectedFont);
    }
  };

  const commonStyle = {
    width: "200px",
    height: "32px",
    padding: "4px 8px",
    fontSize: "14px",
    border: "1px solid var(--spice-button-disabled)",
    borderRadius: "4px",
    backgroundColor: "var(--spice-button)",
    color: "var(--spice-text)",
    boxSizing: "border-box",
  };

  const fontSelector = react.createElement(
    "div",
    { style: { display: "flex", gap: "10px", alignItems: "center" } },
    useCustomFont
      ? react.createElement("input", {
        type: "text",
        value: customFont,
        onChange: handleCustomFontChange,
        placeholder: I18n.t("settings.fontPlaceholder"),
        style: commonStyle,
      })
      : react.createElement(
        "select",
        {
          value: selectedFont,
          onChange: handleFontChange,
          style: commonStyle,
        },
        GOOGLE_FONTS.map((font) =>
          react.createElement("option", { key: font, value: font }, font)
        )
      ),
    react.createElement(ButtonSVG, {
      icon: Spicetify.SVGIcons.edit,
      active: useCustomFont,
      onClick: handleCheckboxChange,
    })
  );

  // name이 있으면 전체 setting-row로 래핑, 없으면 컨트롤만 반환
  if (name) {
    return react.createElement(
      "div",
      { className: "setting-row" },
      react.createElement(
        "div",
        { className: "setting-row-content" },
        react.createElement(
          "div",
          { className: "setting-row-left" },
          react.createElement("div", { className: "setting-name" }, name),
          info &&
          react.createElement("div", {
            className: "setting-description",
            dangerouslySetInnerHTML: {
              __html: info,
            },
          })
        ),
        react.createElement(
          "div",
          { className: "setting-row-right" },
          fontSelector
        )
      )
    );
  }

  return fontSelector;
};

const ConfigAdjust = ({
  name,
  defaultValue,
  step,
  min,
  max,
  onChange = () => { },
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function adjust(dir) {
    let temp = value + dir * step;
    if (temp < min) {
      temp = min;
    } else if (temp > max) {
      temp = max;
    }
    setValue(temp);
    onChange(temp);
  }
  return react.createElement(
    "div",
    { className: "adjust-container" },
    react.createElement(
      "button",
      {
        className: "adjust-button",
        onClick: () => adjust(-1),
        disabled: value === min,
        "aria-label": "Decrease",
      },
      "-"
    ),
    react.createElement("span", { className: "adjust-value" }, value),
    react.createElement(
      "button",
      {
        className: "adjust-button",
        onClick: () => adjust(1),
        disabled: value === max,
        "aria-label": "Increase",
      },
      "+"
    )
  );
};

const ConfigHotkey = ({ name, defaultValue, onChange = () => { } }) => {
  const [value, setValue] = useState(defaultValue);
  const [trap] = useState(new Spicetify.Mousetrap());

  function record() {
    trap.handleKey = (character, modifiers, e) => {
      if (e.type === "keydown") {
        const sequence = [...new Set([...modifiers, character])];
        if (sequence.length === 1 && sequence[0] === "esc") {
          onChange("");
          setValue("");
          return;
        }
        setValue(sequence.join("+"));
      }
    };
  }

  function finishRecord() {
    trap.handleKey = () => { };
    onChange(value);
  }

  return react.createElement(
    "div",
    {
      className: "setting-row",
    },
    react.createElement(
      "div",
      { className: "setting-row-content" },
      react.createElement(
        "div",
        { className: "setting-row-left" },
        react.createElement("div", { className: "setting-name" }, name)
      ),
      react.createElement(
        "div",
        { className: "setting-row-right" },
        react.createElement("input", {
          type: "text",
          value,
          onFocus: record,
          onBlur: finishRecord,
        })
      )
    )
  );
};

const ServiceAction = ({ item, setTokenCallback }) => {
  switch (item.name) {
    case "local":
      return react.createElement(CacheButton);
    default:
      return null;
  }
};

const ServiceOption = react.memo(
  ({
    item,
    onToggle,
    onSwap,
    isFirst = false,
    isLast = false,
    onTokenChange = null,
  }) => {
    const [token, setToken] = useState(item.token);
    const [active, setActive] = useState(item.on);

    const setTokenCallback = useCallback(
      (token) => {
        setToken(token);
        onTokenChange(item.name, token);
      },
      [item.name, onTokenChange]
    );

    const toggleActive = useCallback(() => {
      setActive((prevActive) => {
        const newState = !prevActive;
        onToggle(item.name, newState);
        return newState;
      });
    }, [item.name, onToggle]);

    return react.createElement(
      react.Fragment,
      null,
      react.createElement(
        "div",
        {
          className: "setting-row",
        },
        react.createElement(
          "div",
          { className: "setting-row-content" },
          react.createElement(
            "div",
            { className: "setting-row-left" },
            react.createElement(
              "div",
              { className: "setting-name" },
              item.name
            ),
            react.createElement("div", {
              className: "setting-description",
              dangerouslySetInnerHTML: {
                __html: item.desc,
              },
            })
          ),
          react.createElement(
            "div",
            {
              className: "setting-row-right",
              style: { display: "flex", gap: "8px", alignItems: "center" },
            },
            react.createElement(ServiceAction, {
              item,
              setTokenCallback,
            }),
            react.createElement(SwapButton, {
              icon: Spicetify.SVGIcons["chart-up"],
              onClick: () => onSwap(item.name, -1),
              disabled: isFirst,
            }),
            react.createElement(SwapButton, {
              icon: Spicetify.SVGIcons["chart-down"],
              onClick: () => onSwap(item.name, 1),
              disabled: isLast,
            }),
            react.createElement(ButtonSVG, {
              icon: Spicetify.SVGIcons.check,
              active,
              onClick: toggleActive,
            })
          )
        )
      ),
      item.token !== undefined &&
      react.createElement(
        "div",
        {
          className: "service-token-input-wrapper",
          style: {
            padding: "0 16px 12px 16px",
            background: "rgba(28, 28, 30, 0.5)",
            backdropFilter: "blur(30px) saturate(150%)",
            WebkitBackdropFilter: "blur(30px) saturate(150%)",
            borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            borderBottom: "0.5px solid rgba(255, 255, 255, 0.08)",
            marginTop: "-1px",
          },
        },
        react.createElement("input", {
          type: "text",
          placeholder: `Place your ${item.name} token here`,
          value: token,
          onChange: (event) => setTokenCallback(event.target.value),
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "#ffffff",
            fontSize: "13px",
            width: "100%",
            boxSizing: "border-box",
            fontFamily:
              "Pretendard Variable, -apple-system, BlinkMacSystemFont, sans-serif",
          },
        })
      )
    );
  }
);

const ServiceList = ({
  itemsList,
  onListChange = () => { },
  onToggle = () => { },
  onTokenChange = () => { },
}) => {
  const [items, setItems] = useState(itemsList);
  const maxIndex = items.length - 1;

  const onSwap = useCallback(
    (name, direction) => {
      const curPos = items.findIndex((val) => val === name);
      const newPos = curPos + direction;
      [items[curPos], items[newPos]] = [items[newPos], items[curPos]];
      onListChange(items);
      setItems([...items]);
    },
    [items]
  );

  const renderedItems = items.map((key, index) => {
    const item = CONFIG.providers[key];
    item.name = key;
    return react.createElement(ServiceOption, {
      item,
      key,
      isFirst: index === 0,
      isLast: index === maxIndex,
      onSwap,
      onTokenChange,
      onToggle,
    });
  });

  // ServiceList도 wrapper로 감싸기
  return react.createElement(
    "div",
    { className: "service-list-wrapper" },
    ...renderedItems
  );
};

const OptionList = ({ type, items, onChange }) => {
  const [itemList, setItemList] = useState(items);
  const [, forceUpdate] = useState();

  useEffect(() => {
    if (!type) return;

    const eventListener = (event) => {
      if (event.detail?.type !== type) return;
      setItemList(event.detail.items);
    };
    document.addEventListener("lyrics-plus", eventListener);

    return () => document.removeEventListener("lyrics-plus", eventListener);
  }, []);

  const renderedItems = (itemList || []).map((item, index) => {
    if (!item || (item.when && !item.when())) {
      return;
    }

    const onChangeItem = item.onChange || onChange;
    const isDisabled =
      typeof item.disabled === "function"
        ? item.disabled()
        : item.disabled || false;

    // ConfigButton, ConfigInput, ConfigHotkey는 자체적으로 setting-row를 만들므로 wrapper 불필요
    if (
      item.type === ConfigButton ||
      item.type === ConfigInput ||
      item.type === ConfigHotkey ||
      item.type === ConfigWarning
    ) {
      return react.createElement(item.type, {
        ...item,
        key: index,
        name: item.desc,
        text: item.text,
        disabled: isDisabled,
        defaultValue:
          item.defaultValue !== undefined
            ? item.defaultValue
            : CONFIG.visual[item.key],
        onChange: (value, event) => {
          if (!isDisabled) {
            onChangeItem(item.key, value, event);
            forceUpdate({});
          }
        },
      });
    }

    // 나머지 타입들은 wrapper로 감싸기
    return react.createElement(
      "div",
      {
        key: index,
        className: "setting-row",
        style: isDisabled ? { opacity: 0.5, pointerEvents: "none" } : {},
      },
      react.createElement(
        "div",
        { className: "setting-row-content" },
        react.createElement(
          "div",
          { className: "setting-row-left" },
          react.createElement("div", { className: "setting-name" }, item.desc),
          item.info &&
          react.createElement("div", {
            className: "setting-description",
            dangerouslySetInnerHTML: {
              __html: item.info,
            },
          })
        ),
        react.createElement(
          "div",
          { className: "setting-row-right" },
          react.createElement(item.type, {
            ...item,
            name: item.desc,
            disabled: isDisabled,
            defaultValue:
              item.defaultValue !== undefined
                ? item.defaultValue
                : CONFIG.visual[item.key],
            onChange: (value) => {
              if (!isDisabled) {
                onChangeItem(item.key, value);
                forceUpdate({});
              }
            },
          })
        )
      )
    );
  });

  // Wrapper로 감싸서 반환
  return react.createElement(
    "div",
    { className: "option-list-wrapper" },
    ...renderedItems
  );
};

const languageCodes =
  "none,en,af,ar,bg,bn,ca,zh,cs,da,de,el,es,et,fa,fi,fr,gu,he,hi,hr,hu,id,is,it,ja,jv,kn,ko,lt,lv,ml,mr,ms,nl,no,pl,pt,ro,ru,sk,sl,sr,su,sv,ta,te,th,tr,uk,ur,vi,zu".split(
    ","
  );

const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
const languageOptions = languageCodes.reduce((acc, code) => {
  acc[code] = code === "none" ? "None" : displayNames.of(code);
  return acc;
}, {});

// Pre-defined styles to avoid recreation on each render
const MODAL_STYLES = {
  header: { margin: 0, fontSize: "18px", fontWeight: "600" },
  previewTitle: { marginTop: 0, marginBottom: "10px" },
};

const ConfigModal = () => {
  const [activeTab, setActiveTab] = react.useState("general");

  // Initialize line-spacing if not set
  if (CONFIG.visual["line-spacing"] === undefined) {
    CONFIG.visual["line-spacing"] = 8;
  }

  // FAD (Full Screen) 확장 프로그램 감지
  const isFadActive = react.useMemo(() => {
    return !!document.getElementById("fad-lyrics-plus-container");
  }, []);

  // 컴포넌트 마운트 시 저장된 폰트 설정 로드 및 Google Font 링크 추가
  react.useEffect(() => {
    const loadFont = (fontFamily, linkIdPrefix) => {
      if (!fontFamily) return;

      // Split by comma and trim whitespace to handle multiple fonts
      const fonts = fontFamily.split(",").map((f) => f.trim().replace(/['"]/g, ""));

      fonts.forEach((font) => {
        console.log(
          `[Lyrics Plus] Checking font: ${font} for loading`
        );

        if (font && GOOGLE_FONTS.includes(font)) {
          // Create unique ID for each font to avoid duplicates
          const fontId = font.replace(/ /g, "-").toLowerCase();
          const linkId = `lyrics-plus-google-font-${fontId}`;

          let link = document.getElementById(linkId);
          if (!link) {
            link = document.createElement("link");
            link.id = linkId;
            link.rel = "stylesheet";
            document.head.appendChild(link);
            console.log(
              `[Lyrics Plus] Created new link element for: ${font}`
            );

            if (font === "Pretendard Variable") {
              link.href =
                "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css";
            } else {
              link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
                / /g,
                "+"
              )}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
            }
            console.log(`[Lyrics Plus] Font link href set to: ${link.href}`);
          }
        } else {
          console.log(
            `[Lyrics Plus] Font ${font} not in GOOGLE_FONTS list or invalid`
          );
        }
      });
    };

    // 기본 폰트 로드 (separate-fonts가 false일 때 사용)
    const baseFont = CONFIG.visual["font-family"];
    console.log(`[Lyrics Plus] Base font from CONFIG: ${baseFont}`);
    loadFont(baseFont, "lyrics-plus-google-font-base");

    // 원문 폰트 로드
    const originalFont = CONFIG.visual["original-font-family"];
    console.log(`[Lyrics Plus] Original font from CONFIG: ${originalFont}`);
    loadFont(originalFont, "lyrics-plus-google-font-original");

    // 발음 폰트 로드
    const phoneticFont = CONFIG.visual["phonetic-font-family"];
    console.log(`[Lyrics Plus] Phonetic font from CONFIG: ${phoneticFont}`);
    loadFont(phoneticFont, "lyrics-plus-google-font-phonetic");

    // 번역 폰트 로드
    const translationFont = CONFIG.visual["translation-font-family"];
    console.log(
      `[Lyrics Plus] Translation font from CONFIG: ${translationFont}`
    );
    loadFont(translationFont, "lyrics-plus-google-font-translation");
  }, []);

  // 외관 탭으로 전환될 때 미리보기 폰트 강제 업데이트
  react.useEffect(() => {
    if (activeTab === "appearance") {
      console.log(
        `[Lyrics Plus] Appearance tab activated, updating preview fonts`
      );
      // 약간의 지연을 주어 DOM이 렌더링된 후 실행
      setTimeout(() => {
        const lyricsPreview = document.getElementById("lyrics-preview");
        const phoneticPreview = document.getElementById("phonetic-preview");
        const translationPreview = document.getElementById(
          "translation-preview"
        );

        const originalFont = CONFIG.visual["original-font-family"];
        const phoneticFont = CONFIG.visual["phonetic-font-family"];
        const translationFont = CONFIG.visual["translation-font-family"];

        console.log(
          `[Lyrics Plus] Fonts - original: ${originalFont}, phonetic: ${phoneticFont}, translation: ${translationFont}`
        );

        if (lyricsPreview) {
          // 기본값으로 초기화
          lyricsPreview.style.fontFamily = "var(--font-family)";
          // 짧은 지연 후 실제 폰트 적용
          setTimeout(() => {
            console.log(
              `[Lyrics Plus] Setting lyrics preview font to: ${originalFont}`
            );
            lyricsPreview.style.fontFamily =
              originalFont || "Pretendard Variable";
          }, 10);
        }

        if (phoneticPreview) {
          phoneticPreview.style.fontFamily = "var(--font-family)";
          setTimeout(() => {
            console.log(
              `[Lyrics Plus] Setting phonetic preview font to: ${phoneticFont}`
            );
            phoneticPreview.style.fontFamily =
              phoneticFont || "Pretendard Variable";
          }, 10);
        }

        if (translationPreview) {
          translationPreview.style.fontFamily = "var(--font-family)";
          setTimeout(() => {
            console.log(
              `[Lyrics Plus] Setting translation preview font to: ${translationFont}`
            );
            translationPreview.style.fontFamily =
              translationFont || "Pretendard Variable";
          }, 10);
        }
      }, 50);
    }
  }, [activeTab]);

  // 패치노트 불러오기
  useEffect(() => {
    if (activeTab === "about") {
      const loadPatchNotes = async () => {
        const container = document.getElementById("patch-notes-container");
        if (!container) return;

        try {
          const response = await fetch(
            "https://api.github.com/repos/ivLis-Studio/lyrics-plus/releases/latest"
          );

          if (!response.ok) {
            throw new Error("Failed to fetch release notes");
          }

          const data = await response.json();
          const version = data.tag_name || "Unknown";
          const publishedDate = data.published_at
            ? new Date(data.published_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            : "Unknown";

          // Markdown을 HTML로 변환
          let body = data.body || I18n.t("settingsAdvanced.patchNotes.empty");

          // 마크다운 변환 (순서 중요)
          body = body
            // 코드 블록 먼저 처리 (```로 감싼 부분)
            .replace(/```[\s\S]*?```/g, (match) => {
              return `<pre style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 12px 0;"><code style="font-family: monospace; font-size: 13px; color: rgba(255,255,255,0.9);">${match.slice(3, -3).trim()}</code></pre>`;
            })
            // 헤딩 처리
            .replace(/^#### (.*?)$/gm, '<h5 style="margin: 14px 0 6px; color: #ffffff; font-size: 15px; font-weight: 600;">$1</h5>')
            .replace(/^### (.*?)$/gm, '<h4 style="margin: 16px 0 8px; color: #ffffff; font-size: 16px; font-weight: 600;">$1</h4>')
            .replace(/^## (.*?)$/gm, '<h3 style="margin: 20px 0 10px; color: #ffffff; font-size: 18px; font-weight: 700;">$1</h3>')
            .replace(/^# (.*?)$/gm, '<h2 style="margin: 24px 0 12px; color: #ffffff; font-size: 20px; font-weight: 700;">$1</h2>')
            // 인라인 코드
            .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #fbbf24;">$1</code>')
            // 볼드와 이탤릭
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // 이미지
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; display: block;" />')
            // 링크
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #60a5fa; text-decoration: none; border-bottom: 1px solid rgba(96, 165, 250, 0.3); transition: border-color 0.2s;" onmouseover="this.style.borderBottomColor=\'rgba(96, 165, 250, 0.8)\'" onmouseout="this.style.borderBottomColor=\'rgba(96, 165, 250, 0.3)\'">$1</a>')
            // 체크박스 리스트
            .replace(/^- \[x\] (.*?)$/gm, '<li style="margin: 6px 0; list-style: none;"><span style="color: #4ade80; margin-right: 6px;">✓</span>$1</li>')
            .replace(/^- \[ \] (.*?)$/gm, '<li style="margin: 6px 0; list-style: none;"><span style="color: rgba(255,255,255,0.3); margin-right: 6px;">○</span>$1</li>')
            // 일반 리스트 (-, *, +)
            .replace(/^[\-\*\+] (.*?)$/gm, '<li style="margin: 6px 0; padding-left: 4px;">$1</li>')
            // 숫자 리스트
            .replace(/^\d+\. (.*?)$/gm, '<li style="margin: 6px 0; padding-left: 4px;">$1</li>')
            // 블록쿼트
            .replace(/^> (.*?)$/gm, '<blockquote style="margin: 12px 0; padding-left: 16px; border-left: 3px solid rgba(96, 165, 250, 0.5); color: rgba(255,255,255,0.7); font-style: italic;">$1</blockquote>')
            // 구분선
            .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />')
            .replace(/^\*\*\*$/gm, '<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />')
            // 줄바꿈 처리 (두 번 연속된 줄바꿈은 단락 구분)
            .replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.7;">');

          // li 태그들을 ul/ol로 감싸기
          body = body.replace(/(<li[^>]*>.*?<\/li>(\s|<br\/>)*)+/gs, (match) => {
            // 체크박스나 일반 리스트인 경우
            if (match.includes('list-style: none')) {
              return `<ul style="margin: 8px 0 16px; padding-left: 8px; list-style: none;">${match}</ul>`;
            }
            return `<ul style="margin: 8px 0 16px; padding-left: 24px; list-style: disc;">${match}</ul>`;
          });

          // 시작 p 태그 추가
          if (!body.startsWith('<h') && !body.startsWith('<ul') && !body.startsWith('<pre')) {
            body = `<p style="margin: 12px 0; line-height: 1.7;">${body}`;
          }
          // 끝 p 태그 추가
          if (!body.endsWith('</p>') && !body.endsWith('</ul>') && !body.endsWith('</pre>')) {
            body = `${body}</p>`;
          }

          container.style.display = "block";
          container.style.alignItems = "flex-start";
          container.style.justifyContent = "flex-start";
          container.innerHTML = `
            <div style="width: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div>
                  <h3 style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 700;">${version}</h3>
                  <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">${publishedDate}</p>
                </div>
                <a href="${data.html_url}" target="_blank" style="
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  padding: 6px 12px;
                  background: rgba(255,255,255,0.05);
                  border: 1px solid rgba(255,255,255,0.1);
                  border-radius: 8px;
                  color: #60a5fa;
                  text-decoration: none;
                  font-size: 13px;
                  font-weight: 600;
                  transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                  ${I18n.t("settingsAdvanced.aboutTab.viewOnGithub")}
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"/>
                    <path d="M10.75 1a.75.75 0 000 1.5h1.69L8.22 6.72a.75.75 0 001.06 1.06l4.22-4.22v1.69a.75.75 0 001.5 0V1h-4.25z"/>
                  </svg>
                </a>
              </div>
              <div style="line-height: 1.7; color: rgba(255,255,255,0.85); font-size: 14px;">
                ${body}
              </div>
            </div>
          `;
        } catch (error) {
          console.error("Failed to load patch notes:", error);
          container.style.display = "flex";
          container.style.alignItems = "center";
          container.style.justifyContent = "center";
          container.innerHTML = `
            <div style="text-align: center; color: rgba(255,255,255,0.5);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 12px; opacity: 0.3;">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p style="margin: 0; font-size: 14px;">${I18n.t("settingsAdvanced.aboutTab.patchNotesLoadFailed")}</p>
              <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.7;">${I18n.t("settingsAdvanced.aboutTab.checkGithubReleases")}</p>
            </div>
          `;
        }
      };

      // 짧은 지연 후 로드 (DOM이 준비되도록)
      setTimeout(loadPatchNotes, 100);
    }
  }, [activeTab]);

  const HeaderSection = () => {
    return react.createElement(
      "div",
      { className: "settings-header" },
      react.createElement(
        "div",
        { className: "settings-header-content" },
        react.createElement(
          "div",
          { className: "settings-title-section" },
          react.createElement("h1", null, "Lyrics Plus"),
          react.createElement(
            "span",
            { className: "settings-version" },
            `v${Utils.currentVersion}`
          )
        ),
        react.createElement(
          "div",
          { className: "settings-buttons" },
          react.createElement(
            "button",
            {
              className: "settings-github-btn",
              onClick: () =>
                window.open(
                  "https://github.com/ivLis-Studio/lyrics-plus",
                  "_blank"
                ),
              title: I18n.t("settingsAdvanced.aboutTab.visitGithub"),
            },
            react.createElement("svg", {
              width: 16,
              height: 16,
              viewBox: "0 0 16 16",
              fill: "currentColor",
              dangerouslySetInnerHTML: {
                __html:
                  '<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>',
              },
            }),
            react.createElement("span", null, "GitHub")
          ),
          react.createElement(
            "button",
            {
              className: "settings-discord-btn",
              onClick: () =>
                window.open(
                  "https://ivlis.kr/lyrics-plus/discord.php",
                  "_blank"
                ),
              title: I18n.t("settingsAdvanced.aboutTab.joinDiscord"),
            },
            react.createElement("svg", {
              width: 16,
              height: 16,
              viewBox: "0 0 24 24",
              fill: "currentColor",
              dangerouslySetInnerHTML: {
                __html:
                  '<path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.05-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>',
              },
            }),
            react.createElement("span", null, "Discord")
          ),
          react.createElement(
            "button",
            {
              className: "settings-coffee-btn",
              onClick: () =>
                window.open(
                  "https://buymeacoffee.com/ivlis",
                  "_blank"
                ),
              title: I18n.t("settingsAdvanced.donate.title"),
            },
            react.createElement("svg", {
              width: 16,
              height: 16,
              viewBox: "0 0 24 24",
              fill: "currentColor",
              dangerouslySetInnerHTML: {
                __html:
                  '<path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/>',
              },
            }),
            react.createElement("span", null, I18n.t("settingsAdvanced.donate.button"))
          )
        )
      )
    );
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => {
    return react.createElement(
      "button",
      {
        className: `settings-tab-btn ${isActive ? "active" : ""}`,
        "data-tab-id": id,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(id);
        },
      },
      label
    );
  };

  const TabContainer = ({ children }) => {
    return react.createElement(
      "div",
      {
        className: "settings-content",
      },
      children
    );
  };

  const SectionTitle = ({ title, subtitle }) => {
    return react.createElement(
      "div",
      { className: "section-title" },
      react.createElement(
        "div",
        { className: "section-title-content" },
        react.createElement(
          "div",
          { className: "section-text" },
          react.createElement("h3", null, title),
          subtitle && react.createElement("p", null, subtitle)
        )
      )
    );
  };

  return react.createElement(
    "div",
    {
      id: `${APP_NAME}-config-container`,
    },
    react.createElement("style", {
      dangerouslySetInnerHTML: {
        __html: `
/* 전체 컨테이너 - iOS 18 스타일 */
#${APP_NAME}-config-container {
    padding: 0;
    height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: transparent;
    font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
}

/* 헤더 영역 - iOS 스타일 */
#${APP_NAME}-config-container .settings-header {
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.15);
    padding: 20px 32px 16px;
    flex-shrink: 0;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

#${APP_NAME}-config-container .settings-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#${APP_NAME}-config-container .settings-title-section {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

#${APP_NAME}-config-container .settings-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}

#${APP_NAME}-config-container .settings-title-section h1 {
    font-size: 34px;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
    letter-spacing: -0.02em;
}

#${APP_NAME}-config-container .settings-version {
    font-size: 11px;
    color: #8e8e93;
    font-weight: 600;
    padding: 3px 8px;
    background: #1c1c1e;
    border-radius: 6px;
}

#${APP_NAME}-config-container .settings-github-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #1c1c1e;
    border: none;
    border-radius: 10px;
    color: #ffffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 600;
}

#${APP_NAME}-config-container .settings-github-btn:hover {
    background: #2c2c2e;
    transform: scale(1.02);
}

#${APP_NAME}-config-container .settings-github-btn:active {
    background: #3a3a3c;
    transform: scale(0.98);
}

#${APP_NAME}-config-container .settings-coffee-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #FFDD00 0%, #FBB034 100%);
    border: none;
    border-radius: 10px;
    color: #000000;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 221, 0, 0.3);
}

#${APP_NAME}-config-container .settings-coffee-btn:hover {
    background: linear-gradient(135deg, #FFE84D 0%, #FFBE5B 100%);
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(255, 221, 0, 0.4);
}

#${APP_NAME}-config-container .settings-coffee-btn:active {
    background: linear-gradient(135deg, #E6C700 0%, #E29F2E 100%);
    transform: scale(0.98);
}

/* 탭 영역 - iOS 세그먼트 컨트롤 스타일 */
#${APP_NAME}-config-container .settings-tabs {
    display: flex;
    gap: 8px;
    padding: 12px 32px;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
    overflow-x: auto;
    scrollbar-width: none;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

#${APP_NAME}-config-container .settings-tabs::-webkit-scrollbar {
    display: none;
}

#${APP_NAME}-config-container .settings-tab-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    background: #1c1c1e;
    border: none;
    border-radius: 10px;
    color: #8e8e93;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
    min-width: fit-content;
}

#${APP_NAME}-config-container .settings-tab-btn:hover {
    background: #2c2c2e;
    color: #ffffff;
}

#${APP_NAME}-config-container .settings-tab-btn.active {
    background: #007aff;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

#${APP_NAME}-config-container .tab-icon {
    font-size: 14px;
}

/* 콘텐츠 영역 - iOS 스타일 */
#${APP_NAME}-config-container .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 32px 32px;
    background: transparent;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar {
    width: 12px;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar-track {
    background: transparent;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border: 3px solid transparent;
    border-radius: 6px;
    background-clip: padding-box;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar-thumb:hover {
    background: #48484a;
}

#${APP_NAME}-config-container .tab-content {
    display: none;
}

#${APP_NAME}-config-container .tab-content.active {
    display: block;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 섹션 타이틀 - iOS 스타일 카드 */
#${APP_NAME}-config-container .section-title {
    margin: 24px 0 0;
    padding: 16px 16px 12px;
    border: none;
    background: rgba(28, 28, 30, 0.5);
    backdrop-filter: blur(30px) saturate(150%);
    -webkit-backdrop-filter: blur(30px) saturate(150%);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: none;
}

#${APP_NAME}-config-container .section-title:first-child {
    margin-top: 0;
}

#${APP_NAME}-config-container .section-title-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

#${APP_NAME}-config-container .section-icon {
    display: none;
}

#${APP_NAME}-config-container .section-text h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.02em;
}

#${APP_NAME}-config-container .section-text p {
    margin: 2px 0 0;
    font-size: 13px;
    color: #8e8e93;
    line-height: 1.4;
    letter-spacing: -0.01em;
}

/* 설정 행 - iOS 그룹화된 리스트 스타일 */
#${APP_NAME}-config-container .setting-row {
    padding: 0;
    margin: 0;
    background: rgba(28, 28, 30, 0.5);
    backdrop-filter: blur(30px) saturate(150%);
    -webkit-backdrop-filter: blur(30px) saturate(150%);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0;
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
    transition: background 0.15s ease;
}

/* Wrapper를 통한 그룹화 */
#${APP_NAME}-config-container .option-list-wrapper,
#${APP_NAME}-config-container .service-list-wrapper {
    display: contents;
}

/* 섹션 타이틀 바로 다음의 wrapper의 첫 번째 항목 - 위쪽은 직선으로 */
#${APP_NAME}-config-container .section-title + .option-list-wrapper > .setting-row:first-child,
#${APP_NAME}-config-container .section-title + .service-list-wrapper > .setting-row:first-child {
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

/* wrapper 내의 마지막 항목 */
#${APP_NAME}-config-container .option-list-wrapper > .setting-row:last-child,
#${APP_NAME}-config-container .service-list-wrapper > .setting-row:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* service-token-input-wrapper가 있는 경우 setting-row의 하단 둥글기 제거 */
#${APP_NAME}-config-container .service-list-wrapper > .setting-row:has(+ .service-token-input-wrapper) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

/* service-token-input-wrapper의 마지막 항목에 하단 둥글기 적용 */
#${APP_NAME}-config-container .service-list-wrapper > .service-token-input-wrapper:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* service-token-input-wrapper 다음에 setting-row가 오는 경우 */
#${APP_NAME}-config-container .service-list-wrapper > .service-token-input-wrapper + .setting-row {
    border-top: none;
}

/* wrapper 내에 항목이 하나만 있을 때 */
#${APP_NAME}-config-container .option-list-wrapper > .setting-row:only-child,
#${APP_NAME}-config-container .service-list-wrapper > .setting-row:only-child {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* update-result-container가 있을 때 setting-row의 하단 둥글기 제거 */
#${APP_NAME}-config-container .setting-row:has(+ #update-result-container) {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.08) !important;
}

/* font-preview-container를 카드 그룹으로 스타일링 */
#${APP_NAME}-config-container .font-preview-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0 0 12px 12px;
    backdrop-filter: blur(30px) saturate(150%);
    -webkit-backdrop-filter: blur(30px) saturate(150%);
    padding: 0;
    margin-bottom: 24px;
}

#${APP_NAME}-config-container .setting-row:hover {
    background: rgba(44, 44, 46, 0.6);
}

#${APP_NAME}-config-container .setting-row:active {
    background: rgba(58, 58, 60, 0.7);
}

#${APP_NAME}-config-container .setting-row-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 12px 16px;
    min-height: 44px;
}

#${APP_NAME}-config-container .setting-row-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

#${APP_NAME}-config-container .setting-name {
    font-weight: 400;
    font-size: 15px;
    color: #ffffff;
    line-height: 1.3;
    letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .setting-description {
    font-size: 13px;
    color: #8e8e93;
    line-height: 1.35;
    letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .setting-row-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 슬라이더 컨트롤 - 개선된 iOS 스타일 */
#${APP_NAME}-config-container .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 280px;
    position: relative;
}

#${APP_NAME}-config-container .config-slider {
    flex: 1;
    height: 28px; /* Increased height for easier interaction */
    background: transparent;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    margin: 0;
}

#${APP_NAME}-config-container .config-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    background: #3a3a3c;
    border-radius: 3px;
    transition: background 0.1s ease;
}

#${APP_NAME}-config-container .config-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    background: #ffffff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
    margin-top: -11px; /* (track_height - thumb_height) / 2 */
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

#${APP_NAME}-config-container .config-slider:hover::-webkit-slider-thumb {
    transform: scale(1.05);
}

#${APP_NAME}-config-container .config-slider:active::-webkit-slider-thumb {
    transform: scale(0.98);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* Firefox Styles */
#${APP_NAME}-config-container .config-slider::-moz-range-track {
    width: 100%;
    height: 6px;
    background: #3a3a3c;
    border-radius: 3px;
    border: none;
}

#${APP_NAME}-config-container .config-slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
    background: #ffffff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
}

#${APP_NAME}-config-container .slider-value {
    min-width: 60px;
    text-align: right;
    font-size: 15px;
    color: #ffffff;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 10px;
    border-radius: 6px;
}

/* 조정 버튼 (+ -) - iOS 스타일 */
#${APP_NAME}-config-container .adjust-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

#${APP_NAME}-config-container .adjust-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2c2c2e;
    border: none;
    border-radius: 10px;
    color: #007aff;
    font-size: 20px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

#${APP_NAME}-config-container .adjust-button:hover {
    background: #3a3a3c;
    transform: scale(1.05);
}

#${APP_NAME}-config-container .adjust-button:active {
    background: #48484a;
    transform: scale(0.95);
}

#${APP_NAME}-config-container .adjust-value {
    min-width: 56px;
    text-align: center;
    font-size: 15px;
    color: #ffffff;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
}

/* 스왑 버튼 (위 아래 화살표) */
#${APP_NAME}-config-container .swap-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
}

#${APP_NAME}-config-container .swap-button:hover {
    background: #323232;
    border-color: #0078d4;
}

#${APP_NAME}-config-container .swap-button:active {
    background: #1f1f1f;
    transform: scale(0.95);
}

#${APP_NAME}-config-container .swap-button svg {
    width: 12px;
    height: 12px;
    fill: #ffffff;
}

/* 컬러피커 */
#${APP_NAME}-config-container .color-picker-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

#${APP_NAME}-config-container .config-color-picker {
    width: 48px;
    height: 36px;
    padding: 2px;
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    border-radius: 2px;
    cursor: pointer;
    transition: border-color 0.1s ease;
}

#${APP_NAME}-config-container .config-color-picker:hover {
    border-color: #505050;
}

#${APP_NAME}-config-container .config-color-picker:focus {
    border-color: #0078d4;
    outline: none;
}

#${APP_NAME}-config-container .config-color-input {
    width: 120px !important;
    background: #2b2b2b !important;
    border: 1px solid #3d3d3d !important;
    border-radius: 2px !important;
    padding: 8px 12px !important;
    font-size: 13px !important;
    color: #ffffff !important;
    font-family: 'Courier New', monospace !important;
    text-transform: uppercase !important;
}

/* 입력 필드 - iOS 스타일 */
#${APP_NAME}-config-container input[type="text"],
#${APP_NAME}-config-container input[type="password"],
#${APP_NAME}-config-container input[type="number"],
#${APP_NAME}-config-container input[type="url"],
#${APP_NAME}-config-container input,
#${APP_NAME}-config-container textarea {
	background: #2c2c2e !important;
	border: none !important;
	border-radius: 8px !important;
	padding: 8px 12px !important;
    width: min(320px, 100%) !important;
    outline: none !important;
    color: #ffffff !important;
    transition: background 0.2s ease, box-shadow 0.2s ease !important;
    font-size: 15px !important;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif !important;
    min-height: 36px !important;
    box-sizing: border-box !important;
    font-weight: 400 !important;
    letter-spacing: -0.01em !important;
}

#${APP_NAME}-config-container select {
	background: #2c2c2e !important;
	border: none !important;
	border-radius: 8px !important;
	padding: 8px 32px 8px 12px !important;
    width: 200px !important;
    outline: none !important;
    color: #ffffff !important;
    transition: background 0.2s ease !important;
    font-size: 15px !important;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif !important;
    min-height: 36px !important;
    height: auto !important;
    box-sizing: border-box !important;
    appearance: none !important;
    background-image: url('data:image/svg+xml;utf8,<svg fill="%238e8e93" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M3 6l5 5.794L13 6z"/></svg>') !important;
    background-repeat: no-repeat !important;
    background-position: right 10px center !important;
    cursor: pointer !important;
    font-weight: 400 !important;
    letter-spacing: -0.01em !important;
}

#${APP_NAME}-config-container input[type="text"]:hover,
#${APP_NAME}-config-container input[type="password"]:hover,
#${APP_NAME}-config-container input[type="number"]:hover,
#${APP_NAME}-config-container input[type="url"]:hover,
#${APP_NAME}-config-container input:hover,
#${APP_NAME}-config-container select:hover,
#${APP_NAME}-config-container textarea:hover {
    background: #3a3a3c !important;
}

#${APP_NAME}-config-container input[type="text"]:focus,
#${APP_NAME}-config-container input[type="password"]:focus,
#${APP_NAME}-config-container input[type="number"]:focus,
#${APP_NAME}-config-container input[type="url"]:focus,
#${APP_NAME}-config-container input:focus,
#${APP_NAME}-config-container select:focus,
#${APP_NAME}-config-container textarea:focus {
    background: #2c2c2e !important;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3) !important;
}

#${APP_NAME}-config-container input::placeholder,
#${APP_NAME}-config-container textarea::placeholder {
    color: #6d6d6d !important;
    opacity: 1 !important;
}

#${APP_NAME}-config-container select option {
    background-color: #2b2b2b;
    color: #ffffff;
    padding: 8px 12px;
}

/* 버튼 스타일 */
#${APP_NAME}-config-container .adjust-value {
    min-width: 48px;
    text-align: center;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
}

#${APP_NAME}-config-container .switch,
#${APP_NAME}-config-container .btn {
    height: 36px;
    min-width: 80px;
    border-radius: 10px;
    background: #007aff;
    border: none;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 15px;
    padding: 0 16px;
    letter-spacing: -0.01em;
}

/* iOS 토글 스위치 - 완전히 새로 작성 */
#${APP_NAME}-config-container .switch-checkbox {
    width: 51px;
    height: 31px;
    border-radius: 15.5px;
    background-color: #3a3a3c;
    border: none;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background-color 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    overflow: hidden;
}

#${APP_NAME}-config-container .switch-checkbox::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
    will-change: transform;
    transform: translateX(0);
}

#${APP_NAME}-config-container .switch-checkbox.active {
    background-color: #34c759;
    transition: background-color 0.2s ease;
}

#${APP_NAME}-config-container .switch-checkbox.active::after {
    transform: translateX(20px);
}

#${APP_NAME}-config-container .switch-checkbox svg {
    display: none !important;
    visibility: hidden !important;
    position: absolute;
    pointer-events: none;
}

#${APP_NAME}-config-container .switch {
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
}

#${APP_NAME}-config-container .switch:hover {
    background: #323232;
    border-color: #505050;
}

#${APP_NAME}-config-container .switch.disabled {
    background: #2b2b2b;
    border-color: #3d3d3d;
    opacity: 0.4;
}

#${APP_NAME}-config-container .btn {
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    color: #ffffff;
    font-weight: 400;
    padding: 0 16px;
}

#${APP_NAME}-config-container .btn:hover:not(:disabled) {
    background: #323232;
    border-color: #505050;
}

#${APP_NAME}-config-container .btn:active:not(:disabled) {
    background: #1f1f1f;
}

#${APP_NAME}-config-container .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* 글꼴 미리보기 - iOS 스타일 (이미 CSS로 스타일링됨) */
#${APP_NAME}-config-container .font-preview {
    background: transparent;
    border: none;
    padding: 20px;
}

#${APP_NAME}-config-container #lyrics-preview,
#${APP_NAME}-config-container #translation-preview {
    transition: all 0.1s ease;
}

/* 정보 박스 */
#${APP_NAME}-config-container .info-box {
    padding: 20px;
    background: #202020;
    border: 1px solid #2b2b2b;
    border-radius: 2px;
    margin-bottom: 24px;
}

#${APP_NAME}-config-container .info-box h3 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
}

#${APP_NAME}-config-container .info-box p {
    margin: 0 0 8px;
    color: #8a8a8a;
    line-height: 1.6;
    font-size: 13px;
}

#${APP_NAME}-config-container .info-box p:last-child {
    margin-bottom: 0;
}
`,
      },
    }),
    react.createElement(HeaderSection),
    react.createElement(
      "div",
      { className: "settings-tabs" },
      react.createElement(TabButton, {
        id: "general",
        label: I18n.t("tabs.general"),
        icon: "",
        isActive: activeTab === "general",
        onClick: setActiveTab,
      }),
      react.createElement(TabButton, {
        id: "appearance",
        label: I18n.t("tabs.appearance"),
        icon: "",
        isActive: activeTab === "appearance",
        onClick: setActiveTab,
      }),
      react.createElement(TabButton, {
        id: "lyrics",
        label: I18n.t("tabs.behavior"),
        icon: "",
        isActive: activeTab === "lyrics",
        onClick: setActiveTab,
      }),
      react.createElement(TabButton, {
        id: "translation",
        label: I18n.t("tabs.providers"),
        icon: "",
        isActive: activeTab === "translation",
        onClick: setActiveTab,
      }),
      react.createElement(TabButton, {
        id: "advanced",
        label: I18n.t("tabs.advanced"),
        icon: "",
        isActive: activeTab === "advanced",
        onClick: setActiveTab,
      }),
      react.createElement(TabButton, {
        id: "fullscreen",
        label: I18n.t("tabs.fullscreen"),
        icon: "",
        isActive: activeTab === "fullscreen",
        onClick: setActiveTab,
      }),
      react.createElement(TabButton, {
        id: "about",
        label: I18n.t("tabs.about"),
        icon: "",
        isActive: activeTab === "about",
        onClick: setActiveTab,
      })
    ),
    react.createElement(
      TabContainer,
      null,
      // 일반 탭 (동작 관련 설정)
      react.createElement(
        "div",
        {
          className: `tab-content ${activeTab === "general" ? "active" : ""}`,
        },
        // 언어 설정 섹션
        react.createElement(SectionTitle, {
          title: I18n.t("sections.language"),
          subtitle: I18n.t("settings.language.desc"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settings.language.label") + " (Language)",
              key: "language",
              info: I18n.t("settings.language.desc"),
              type: ConfigSelection,
              options: {
                ko: "한국어",
                en: "English",
              },
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            // I18n 시스템에도 언어 변경 알림
            if (window.I18n && window.I18n.setLanguage) {
              window.I18n.setLanguage(value);
            }
            // 설정 페이지로 돌아오기 위해 플래그 저장
            localStorage.setItem("lyrics-plus:return-to-settings", "true");
            // 자동 새로고침
            location.reload();
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("sections.visualEffects"),
          subtitle: I18n.t("sections.visualEffectsSubtitle"),
        }),
        // FAD 경고 메시지
        isFadActive &&
        react.createElement(
          "div",
          {
            className: "setting-row",
            style: {
              backgroundColor: "rgba(var(--spice-rgb-warning), 0.1)",
            },
          },
          react.createElement(
            "div",
            { className: "setting-row-content" },
            react.createElement(
              "div",
              { className: "setting-row-left" },
              react.createElement(
                "div",
                {
                  className: "setting-name",
                  style: { color: "var(--spice-text)", fontWeight: "600" },
                },
                I18n.t("sections.fadWarningTitle")
              ),
              react.createElement(
                "div",
                {
                  className: "setting-description",
                  style: { color: "var(--spice-subtext)" },
                },
                I18n.t("sections.fadWarningDesc"),
                react.createElement("br"),
                I18n.t("sections.fadWarningTip")
              )
            )
          )
        ),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settings.alignment.label"),
              key: "alignment",
              info: I18n.t("settings.alignment.desc"),
              type: ConfigSelection,
              disabled: isFadActive,
              options: {
                left: I18n.t("settings.alignment.options.left"),
                center: I18n.t("settings.alignment.options.center"),
                right: I18n.t("settings.alignment.options.right"),
              },
            },
            {
              desc: I18n.t("settings.noise.label"),
              key: "noise",
              info: I18n.t("settings.noise.desc"),
              type: ConfigSlider,
              disabled: isFadActive,
            },
            {
              desc: I18n.t("settings.colorful.label"),
              key: "colorful",
              info: I18n.t("settings.colorful.desc"),
              type: ConfigSlider,
              disabled: isFadActive,
            },
            {
              desc: I18n.t("settings.gradientBackground.label"),
              info: I18n.t("settings.gradientBackground.desc"),
              key: "gradient-background",
              type: ConfigSlider,
              disabled: isFadActive,
            },
            {
              desc: I18n.t("settings.solidBackground.label"),
              info: I18n.t("settings.solidBackground.desc"),
              key: "solid-background",
              type: ConfigSlider,
              disabled: isFadActive,
            },
            {
              desc: I18n.t("settings.solidBackgroundColor.label"),
              key: "solid-background-color",
              info: I18n.t("settings.solidBackgroundColor.desc"),
              type: ColorPresetSelector,
              disabled: isFadActive,
              when: () => CONFIG.visual["solid-background"],
            },
            {
              desc: I18n.t("settings.videoBackground.label"),
              info: I18n.t("settings.videoBackground.desc"),
              key: "video-background",
              type: ConfigSlider,
              disabled: isFadActive,
            },
            {
              desc: I18n.t("settings.videoBlur.label"),
              info: I18n.t("settings.videoBlur.desc"),
              key: "video-blur",
              type: ConfigSliderRange,
              disabled: isFadActive,
              when: () => CONFIG.visual["video-background"],
              min: 0,
              max: 40,
              step: 1,
              unit: "px",
            },
            {
              desc: I18n.t("settings.videoCover.label"),
              info: I18n.t("settings.videoCover.desc"),
              key: "video-cover",
              type: ConfigSlider,
              disabled: isFadActive,
              when: () => CONFIG.visual["video-background"],
            },
            {
              desc: "",
              key: "solid-background-warning",
              type: ConfigWarning,
              message: I18n.t("settings.solidBackgroundWarning"),
              when: () => CONFIG.visual["solid-background"],
            },
            {
              desc: I18n.t("settings.backgroundBrightness.label"),
              key: "background-brightness",
              info: I18n.t("settings.backgroundBrightness.desc"),
              type: ConfigSliderRange,
              disabled: () => isFadActive || CONFIG.visual["solid-background"],
              min: 0,
              max: 100,
              step: 1,
              unit: "%",
            },
          ],
          onChange: (name, value) => {
            // 컬러풀 배경, 앨범 커버 배경, 단색 배경, 동영상 배경은 상호 배타적으로 동작
            if (name === "colorful" && value) {
              CONFIG.visual["gradient-background"] = false;
              CONFIG.visual["solid-background"] = false;
              CONFIG.visual["video-background"] = false;
              StorageManager.saveConfig("gradient-background", false);
              StorageManager.saveConfig("solid-background", false);
              StorageManager.saveConfig("video-background", false);
            } else if (name === "gradient-background" && value) {
              CONFIG.visual["colorful"] = false;
              CONFIG.visual["solid-background"] = false;
              CONFIG.visual["video-background"] = false;
              StorageManager.saveConfig("colorful", false);
              StorageManager.saveConfig("solid-background", false);
              StorageManager.saveConfig("video-background", false);
            } else if (name === "solid-background" && value) {
              CONFIG.visual["colorful"] = false;
              CONFIG.visual["gradient-background"] = false;
              CONFIG.visual["video-background"] = false;
              StorageManager.saveConfig("colorful", false);
              StorageManager.saveConfig("gradient-background", false);
              StorageManager.saveConfig("video-background", false);
            } else if (name === "video-background" && value) {
              CONFIG.visual["colorful"] = false;
              CONFIG.visual["gradient-background"] = false;
              CONFIG.visual["solid-background"] = false;
              StorageManager.saveConfig("colorful", false);
              StorageManager.saveConfig("gradient-background", false);
              StorageManager.saveConfig("solid-background", false);
            }

            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            const configChange = new CustomEvent("lyrics-plus", {
              detail: {
                type: "config",
                name: name,
                value: value,
              },
            });
            window.dispatchEvent(configChange);
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.syncMode.title"),
          subtitle: I18n.t("settingsAdvanced.syncMode.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.syncMode.linesBefore.label"),
              key: "lines-before",
              info: I18n.t("settingsAdvanced.syncMode.linesBefore.desc"),
              type: ConfigSelection,
              options: [0, 1, 2, 3, 4],
            },
            {
              desc: I18n.t("settingsAdvanced.syncMode.linesAfter.label"),
              key: "lines-after",
              info: I18n.t("settingsAdvanced.syncMode.linesAfter.desc"),
              type: ConfigSelection,
              options: [0, 1, 2, 3, 4],
            },
            {
              desc: I18n.t("settingsAdvanced.syncMode.fadeoutBlur.label"),
              key: "fade-blur",
              info: I18n.t("settingsAdvanced.syncMode.fadeoutBlur.desc"),
              type: ConfigSlider,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            const configChange = new CustomEvent("lyrics-plus", {
              detail: {
                type: "config",
                name: name,
                value: value,
              },
            });
            window.dispatchEvent(configChange);
          },
        })
      ),
      // 외관 탭 (시각 효과 + 타이포그래피)
      react.createElement(
        "div",
        {
          className: `tab-content ${activeTab === "appearance" ? "active" : ""
            }`,
        },
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.livePreview.title"),
          subtitle: I18n.t("settingsAdvanced.livePreview.subtitle"),
        }),
        react.createElement(
          "div",
          {
            className: "font-preview-container",
          },
          react.createElement(
            "div",
            {
              className: "font-preview",
            },
            react.createElement(
              "div",
              {
                id: "lyrics-preview",
                style: {
                  fontSize: `${CONFIG.visual["original-font-size"] || 20}px`,
                  fontWeight: CONFIG.visual["original-font-weight"] || "400",
                  fontFamily:
                    CONFIG.visual["original-font-family"] ||
                    "Pretendard Variable",
                  textAlign: CONFIG.visual["alignment"] || "left",
                  opacity: (CONFIG.visual["original-opacity"] || 100) / 100,
                  textShadow: CONFIG.visual["text-shadow-enabled"]
                    ? `0 0 ${CONFIG.visual["text-shadow-blur"] || 2}px ${CONFIG.visual["text-shadow-color"] || "#000000"
                    }${Math.round(
                      (CONFIG.visual["text-shadow-opacity"] || 50) * 2.55
                    )
                      .toString(16)
                      .padStart(2, "0")}`
                    : "none",
                },
              },
              I18n.t("settingsAdvanced.livePreview.sampleTextMixed")
            ),
            react.createElement(
              "div",
              {
                id: "phonetic-preview",
                style: {
                  fontSize: `${CONFIG.visual["phonetic-font-size"] || 20}px`,
                  fontWeight: CONFIG.visual["phonetic-font-weight"] || "400",
                  fontFamily:
                    CONFIG.visual["phonetic-font-family"] ||
                    "Pretendard Variable",
                  textAlign: CONFIG.visual["alignment"] || "left",
                  lineHeight: "1.3",
                  opacity: (CONFIG.visual["phonetic-opacity"] || 70) / 100,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: `${(parseInt(CONFIG.visual["phonetic-spacing"]) || 4) - 10
                    }px`,
                  textShadow: CONFIG.visual["text-shadow-enabled"]
                    ? `0 0 ${CONFIG.visual["text-shadow-blur"] || 2}px ${CONFIG.visual["text-shadow-color"] || "#000000"
                    }${Math.round(
                      (CONFIG.visual["text-shadow-opacity"] || 50) * 2.55
                    )
                      .toString(16)
                      .padStart(2, "0")}`
                    : "none",
                },
              },
              "gasaga hereye dekimasu"
            ),
            react.createElement(
              "div",
              {
                id: "translation-preview",
                style: {
                  fontSize: `${CONFIG.visual["translation-font-size"] || 16}px`,
                  fontWeight: CONFIG.visual["translation-font-weight"] || "400",
                  fontFamily:
                    CONFIG.visual["translation-font-family"] ||
                    "Pretendard Variable",
                  textAlign: CONFIG.visual["alignment"] || "left",
                  lineHeight: "1.4",
                  opacity: (CONFIG.visual["translation-opacity"] || 100) / 100,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: `${parseInt(CONFIG.visual["translation-spacing"]) || 8
                    }px`,
                  textShadow: CONFIG.visual["text-shadow-enabled"]
                    ? `0 0 ${CONFIG.visual["text-shadow-blur"] || 2}px ${CONFIG.visual["text-shadow-color"] || "#000000"
                    }${Math.round(
                      (CONFIG.visual["text-shadow-opacity"] || 50) * 2.55
                    )
                      .toString(16)
                      .padStart(2, "0")}`
                    : "none",
                },
              },
              I18n.t("settingsAdvanced.livePreview.sampleText")
            )
          )
        ),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.originalStyle.title"),
          subtitle: I18n.t("settingsAdvanced.originalStyle.subtitle"),
        }),
        react.createElement(
          "div",
          { className: "setting-row" },
          react.createElement(
            "div",
            { className: "setting-row-content" },
            react.createElement(
              "div",
              { className: "setting-row-left" },
              react.createElement(
                "div",
                { className: "setting-name" },
                I18n.t("settingsAdvanced.originalStyle.fontFamily")
              ),
              react.createElement(
                "div",
                { className: "setting-description" },
                I18n.t("settingsAdvanced.originalStyle.fontFamilyDesc")
              )
            ),
            react.createElement(
              "div",
              { className: "setting-row-right font-selector-container" },
              react.createElement(ConfigFontSelector, {
                name: "",
                defaultValue:
                  CONFIG.visual["original-font-family"] ||
                  "Pretendard Variable",
                onChange: (value) => {
                  CONFIG.visual["original-font-family"] = value;
                  StorageManager.setItem(
                    `${APP_NAME}:visual:original-font-family`,
                    value
                  );

                  if (value) {
                    const fonts = value.split(",").map((f) => f.trim().replace(/['"]/g, ""));
                    fonts.forEach((font) => {
                      if (font && GOOGLE_FONTS.includes(font)) {
                        const fontId = font.replace(/ /g, "-").toLowerCase();
                        const linkId = `lyrics-plus-google-font-${fontId}`;

                        let link = document.getElementById(linkId);
                        if (!link) {
                          link = document.createElement("link");
                          link.id = linkId;
                          link.rel = "stylesheet";
                          document.head.appendChild(link);
                        }
                        if (font === "Pretendard Variable") {
                          link.href =
                            "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css";
                        } else {
                          link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
                            / /g,
                            "+"
                          )}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
                        }
                      }
                    });
                  }

                  const lyricsPreview =
                    document.getElementById("lyrics-preview");
                  if (lyricsPreview) {
                    lyricsPreview.style.fontFamily = value;
                  }

                  lyricContainerUpdate?.();
                  window.dispatchEvent(
                    new CustomEvent("lyrics-plus", {
                      detail: {
                        type: "config",
                        name: "original-font-family",
                        value,
                      },
                    })
                  );
                },
              })
            )
          )
        ),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.originalStyle.fontSize.label"),
              info: I18n.t("settingsAdvanced.originalStyle.fontSize.desc"),
              key: "original-font-size",
              type: ConfigSliderRange,
              min: 12,
              max: 128,
              step: 2,
              unit: "px",
            },
            {
              desc: I18n.t("settingsAdvanced.originalStyle.fontWeight.label"),
              info: I18n.t("settingsAdvanced.originalStyle.fontWeight.desc"),
              key: "original-font-weight",
              type: ConfigSelection,
              options: {
                100: "Thin (100)",
                200: "Extra Light (200)",
                300: "Light (300)",
                400: "Regular (400)",
                500: "Medium (500)",
                600: "Semi Bold (600)",
                700: "Bold (700)",
                800: "Extra Bold (800)",
                900: "Black (900)",
              },
            },
            {
              desc: I18n.t("settingsAdvanced.originalStyle.opacity.label"),
              info: I18n.t("settingsAdvanced.originalStyle.opacity.desc"),
              key: "original-opacity",
              type: ConfigSliderRange,
              min: 0,
              max: 100,
              step: 5,
              unit: "%",
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.setItem(`${APP_NAME}:visual:${name}`, value);
            const lyricsPreview = document.getElementById("lyrics-preview");
            if (lyricsPreview) {
              if (name === "original-font-size")
                lyricsPreview.style.fontSize = `${value}px`;
              if (name === "original-font-weight")
                lyricsPreview.style.fontWeight = value;
              if (name === "original-opacity")
                lyricsPreview.style.opacity = value / 100;
            }
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.pronunciationStyle.title"),
          subtitle: I18n.t("settingsAdvanced.pronunciationStyle.subtitle"),
        }),
        react.createElement(
          "div",
          { className: "setting-row" },
          react.createElement(
            "div",
            { className: "setting-row-content" },
            react.createElement(
              "div",
              { className: "setting-row-left" },
              react.createElement(
                "div",
                { className: "setting-name" },
                I18n.t("settingsAdvanced.originalStyle.fontFamily")
              ),
              react.createElement(
                "div",
                { className: "setting-description" },
                I18n.t("settingsAdvanced.pronunciationStyle.fontFamilyDesc")
              )
            ),
            react.createElement(
              "div",
              { className: "setting-row-right font-selector-container" },
              react.createElement(ConfigFontSelector, {
                name: "",
                defaultValue:
                  CONFIG.visual["phonetic-font-family"] ||
                  "Pretendard Variable",
                onChange: (value) => {
                  CONFIG.visual["phonetic-font-family"] = value;
                  StorageManager.setItem(
                    `${APP_NAME}:visual:phonetic-font-family`,
                    value
                  );

                  if (value) {
                    const fonts = value.split(",").map((f) => f.trim().replace(/['"]/g, ""));
                    fonts.forEach((font) => {
                      if (font && GOOGLE_FONTS.includes(font)) {
                        const fontId = font.replace(/ /g, "-").toLowerCase();
                        const linkId = `lyrics-plus-google-font-${fontId}`;

                        let link = document.getElementById(linkId);
                        if (!link) {
                          link = document.createElement("link");
                          link.id = linkId;
                          link.rel = "stylesheet";
                          document.head.appendChild(link);
                        }
                        if (font === "Pretendard Variable") {
                          link.href =
                            "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css";
                        } else {
                          link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
                            / /g,
                            "+"
                          )}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
                        }
                      }
                    });
                  }

                  const phoneticPreview =
                    document.getElementById("phonetic-preview");
                  if (phoneticPreview) {
                    phoneticPreview.style.fontFamily = value;
                  }

                  lyricContainerUpdate?.();
                  window.dispatchEvent(
                    new CustomEvent("lyrics-plus", {
                      detail: {
                        type: "config",
                        name: "phonetic-font-family",
                        value,
                      },
                    })
                  );
                },
              })
            )
          )
        ),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.originalStyle.fontSize.label"),
              info: I18n.t("settingsAdvanced.pronunciationStyle.fontSize.desc"),
              key: "phonetic-font-size",
              type: ConfigSliderRange,
              min: 10,
              max: 96,
              step: 2,
              unit: "px",
            },
            {
              desc: I18n.t("settingsAdvanced.originalStyle.fontWeight.label"),
              info: I18n.t("settingsAdvanced.pronunciationStyle.fontWeight.desc"),
              key: "phonetic-font-weight",
              type: ConfigSelection,
              options: {
                100: "Thin (100)",
                200: "Extra Light (200)",
                300: "Light (300)",
                400: "Regular (400)",
                500: "Medium (500)",
                600: "Semi Bold (600)",
                700: "Bold (700)",
                800: "Extra Bold (800)",
                900: "Black (900)",
              },
            },
            {
              desc: I18n.t("settingsAdvanced.originalStyle.opacity.label"),
              info: I18n.t("settingsAdvanced.pronunciationStyle.opacity.desc"),
              key: "phonetic-opacity",
              type: ConfigSliderRange,
              min: 0,
              max: 100,
              step: 5,
              unit: "%",
            },
            {
              desc: I18n.t("settingsAdvanced.pronunciationStyle.gap.label"),
              info: I18n.t("settingsAdvanced.pronunciationStyle.gap.desc"),
              key: "phonetic-spacing",
              type: ConfigSliderRange,
              min: -30,
              max: 20,
              step: 1,
              unit: "px",
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.setItem(`${APP_NAME}:visual:${name}`, value);
            const phoneticPreview = document.getElementById("phonetic-preview");
            if (phoneticPreview) {
              if (name === "phonetic-font-size")
                phoneticPreview.style.fontSize = `${value}px`;
              if (name === "phonetic-font-weight")
                phoneticPreview.style.fontWeight = value;
              if (name === "phonetic-opacity")
                phoneticPreview.style.opacity = value / 100;
              if (name === "phonetic-spacing")
                phoneticPreview.style.marginTop = `${parseInt(value) || 0}px`;
            }
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.translationStyle.title"),
          subtitle: I18n.t("settingsAdvanced.translationStyle.subtitle"),
        }),
        react.createElement(
          "div",
          { className: "setting-row" },
          react.createElement(
            "div",
            { className: "setting-row-content" },
            react.createElement(
              "div",
              { className: "setting-row-left" },
              react.createElement(
                "div",
                { className: "setting-name" },
                I18n.t("settingsAdvanced.originalStyle.fontFamily")
              ),
              react.createElement(
                "div",
                { className: "setting-description" },
                I18n.t("settingsAdvanced.translationStyle.fontFamilyDesc")
              )
            ),
            react.createElement(
              "div",
              { className: "setting-row-right font-selector-container" },
              react.createElement(ConfigFontSelector, {
                name: "",
                defaultValue:
                  CONFIG.visual["translation-font-family"] ||
                  "Pretendard Variable",
                onChange: (value) => {
                  CONFIG.visual["translation-font-family"] = value;
                  StorageManager.setItem(
                    `${APP_NAME}:visual:translation-font-family`,
                    value
                  );

                  if (value) {
                    const fonts = value.split(",").map((f) => f.trim().replace(/['"]/g, ""));
                    fonts.forEach((font) => {
                      if (font && GOOGLE_FONTS.includes(font)) {
                        const fontId = font.replace(/ /g, "-").toLowerCase();
                        const linkId = `lyrics-plus-google-font-${fontId}`;

                        let link = document.getElementById(linkId);
                        if (!link) {
                          link = document.createElement("link");
                          link.id = linkId;
                          link.rel = "stylesheet";
                          document.head.appendChild(link);
                        }
                        if (font === "Pretendard Variable") {
                          link.href =
                            "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css";
                        } else {
                          link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
                            / /g,
                            "+"
                          )}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
                        }
                      }
                    });
                  }

                  const translationPreview = document.getElementById(
                    "translation-preview"
                  );
                  if (translationPreview) {
                    translationPreview.style.fontFamily = value;
                  }

                  lyricContainerUpdate?.();
                  window.dispatchEvent(
                    new CustomEvent("lyrics-plus", {
                      detail: {
                        type: "config",
                        name: "translation-font-family",
                        value,
                      },
                    })
                  );
                },
              })
            )
          )
        ),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.originalStyle.fontSize.label"),
              info: I18n.t("settingsAdvanced.translationStyle.fontSize.desc"),
              key: "translation-font-size",
              type: ConfigSliderRange,
              min: 12,
              max: 128,
              step: 2,
              unit: "px",
            },
            {
              desc: I18n.t("settingsAdvanced.originalStyle.fontWeight.label"),
              info: I18n.t("settingsAdvanced.translationStyle.fontWeight.desc"),
              key: "translation-font-weight",
              type: ConfigSelection,
              options: {
                100: "Thin (100)",
                200: "Extra Light (200)",
                300: "Light (300)",
                400: "Regular (400)",
                500: "Medium (500)",
                600: "Semi Bold (600)",
                700: "Bold (700)",
                800: "Extra Bold (800)",
                900: "Black (900)",
              },
            },
            {
              desc: I18n.t("settingsAdvanced.originalStyle.opacity.label"),
              info: I18n.t("settingsAdvanced.translationStyle.opacity.desc"),
              key: "translation-opacity",
              type: ConfigSliderRange,
              min: 0,
              max: 100,
              step: 5,
              unit: "%",
            },
            {
              desc: I18n.t("settingsAdvanced.translationStyle.gap.label"),
              info: I18n.t("settingsAdvanced.translationStyle.gap.desc"),
              key: "translation-spacing",
              type: ConfigSliderRange,
              min: -20,
              max: 30,
              step: 2,
              unit: "px",
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.setItem(`${APP_NAME}:visual:${name}`, value);
            const translationPreview = document.getElementById(
              "translation-preview"
            );
            if (translationPreview) {
              if (name === "translation-font-size")
                translationPreview.style.fontSize = `${value}px`;
              if (name === "translation-font-weight")
                translationPreview.style.fontWeight = value;
              if (name === "translation-opacity")
                translationPreview.style.opacity = value / 100;
              if (name === "translation-spacing")
                translationPreview.style.marginTop = `${parseInt(value) || 0
                  }px`;
            }
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.textShadow.title"),
          subtitle: I18n.t("settingsAdvanced.textShadow.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.textShadow.enabled.label"),
              info: I18n.t("settingsAdvanced.textShadow.enabled.desc"),
              key: "text-shadow-enabled",
              type: ConfigSlider,
            },
            {
              desc: I18n.t("settingsAdvanced.textShadow.color.label"),
              info: I18n.t("settingsAdvanced.textShadow.color.desc"),
              key: "text-shadow-color",
              type: ConfigColorPicker,
            },
            {
              desc: I18n.t("settingsAdvanced.textShadow.opacity.label"),
              info: I18n.t("settingsAdvanced.textShadow.opacity.desc"),
              key: "text-shadow-opacity",
              type: ConfigSliderRange,
              min: 0,
              max: 100,
              step: 5,
              unit: "%",
            },
            {
              desc: I18n.t("settingsAdvanced.textShadow.blur.label"),
              info: I18n.t("settingsAdvanced.textShadow.blur.desc"),
              key: "text-shadow-blur",
              type: ConfigSliderRange,
              min: 0,
              max: 10,
              step: 1,
              unit: "px",
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.setItem(`${APP_NAME}:visual:${name}`, value);
            const lyricsPreview = document.getElementById("lyrics-preview");
            const phoneticPreview = document.getElementById("phonetic-preview");
            const translationPreview = document.getElementById(
              "translation-preview"
            );

            if (lyricsPreview || phoneticPreview || translationPreview) {
              const shadowEnabled = CONFIG.visual["text-shadow-enabled"];
              const shadowColor =
                CONFIG.visual["text-shadow-color"] || "#000000";
              const shadowOpacity = CONFIG.visual["text-shadow-opacity"] || 50;
              const shadowBlur = CONFIG.visual["text-shadow-blur"] || 2;
              const shadowAlpha = Math.round(shadowOpacity * 2.55)
                .toString(16)
                .padStart(2, "0");
              const shadow = shadowEnabled
                ? `0 0 ${shadowBlur}px ${shadowColor}${shadowAlpha}`
                : "none";
              if (lyricsPreview) lyricsPreview.style.textShadow = shadow;
              if (phoneticPreview) phoneticPreview.style.textShadow = shadow;
              if (translationPreview)
                translationPreview.style.textShadow = shadow;
            }
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        })
      ),
      // 가사 탭 (가사 동기화 및 동작)
      react.createElement(
        "div",
        {
          className: `tab-content ${activeTab === "lyrics" ? "active" : ""}`,
        },
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.playback.title"),
          subtitle: I18n.t("settingsAdvanced.playback.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.playback.replaceButton.label"),
              key: "playbar-button",
              info: I18n.t("settingsAdvanced.playback.replaceButton.info") || "Replaces Spotify's default lyrics button with Lyrics Plus",
              type: ConfigSlider,
            },

            {
              desc: I18n.t("settingsAdvanced.playback.fullscreenShortcut.label"),
              key: "fullscreen-key",
              info: I18n.t("settingsAdvanced.playback.fullscreenShortcut.desc"),
              type: ConfigHotkey,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.karaokeMode.title"),
          subtitle: I18n.t("settingsAdvanced.karaokeMode.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.karaokeMode.enabled.label"),
              info: I18n.t("settingsAdvanced.karaokeMode.enabled.desc"),
              key: "karaoke-mode-enabled",
              type: ConfigSlider,
            },
            {
              desc: I18n.t("settingsAdvanced.karaokeMode.bounce.label"),
              info: I18n.t("settingsAdvanced.karaokeMode.bounce.desc"),
              key: "karaoke-bounce",
              type: ConfigSlider,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.cacheManagement.title"),
          subtitle: I18n.t("settingsAdvanced.cacheManagement.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.cacheManagement.memoryCache.label"),
              info: I18n.t("settingsAdvanced.cacheManagement.memoryCache.desc"),
              key: "clear-memory-cache",
              text: I18n.t("settingsAdvanced.cacheManagement.memoryCache.button"),
              type: ConfigButton,
              onChange: () => {
                reloadLyrics?.();
                Spicetify.showNotification(
                  I18n.t("notifications.memoryCacheCleared"),
                  false,
                  2000
                );
              },
            },
          ],
          onChange: () => { },
        })
      ),
      // 번역 탭 (가사 제공자 포함)
      react.createElement(
        "div",
        {
          className: `tab-content ${activeTab === "translation" ? "active" : ""
            }`,
        },
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.lyricsProviders.title"),
          subtitle: I18n.t("settingsAdvanced.lyricsProviders.subtitle"),
        }),
        react.createElement(ServiceList, {
          itemsList: CONFIG.providersOrder,
          onListChange: (list) => {
            CONFIG.providersOrder = list;
            StorageManager.setItem(
              `${APP_NAME}:services-order`,
              JSON.stringify(list)
            );
            reloadLyrics?.();
          },
          onToggle: (name, value) => {
            CONFIG.providers[name].on = value;
            StorageManager.setItem(`${APP_NAME}:provider:${name}:on`, value);
            reloadLyrics?.();
          },
          onTokenChange: (name, value) => {
            CONFIG.providers[name].token = value;
            StorageManager.setItem(`${APP_NAME}:provider:${name}:token`, value);
            reloadLyrics?.();
          },
        })
      ),
      // 고급 탭
      react.createElement(
        "div",
        {
          className: `tab-content ${activeTab === "advanced" ? "active" : ""}`,
        },
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.languageDetection.title"),
          subtitle: I18n.t("settingsAdvanced.languageDetection.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.languageDetection.furigana.label"),
              info: I18n.t("settingsAdvanced.languageDetection.furigana.desc"),
              key: "furigana-enabled",
              type: ConfigSlider,
            },
            {
              desc: I18n.t("settingsAdvanced.languageDetection.japaneseThreshold.label"),
              info: I18n.t("settingsAdvanced.languageDetection.japaneseThreshold.desc"),
              key: "ja-detect-threshold",
              type: ConfigSliderRange,
              min: thresholdSizeLimit.min,
              max: thresholdSizeLimit.max,
              step: thresholdSizeLimit.step,
              unit: "%",
            },
            {
              desc: I18n.t("settingsAdvanced.languageDetection.chineseThreshold.label"),
              info: I18n.t("settingsAdvanced.languageDetection.chineseThreshold.desc"),
              key: "hans-detect-threshold",
              type: ConfigSliderRange,
              min: thresholdSizeLimit.min,
              max: thresholdSizeLimit.max,
              step: thresholdSizeLimit.step,
              unit: "%",
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.api.title"),
          subtitle: I18n.t("settingsAdvanced.apiKeys.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.api.geminiKey.desc"),
              info: I18n.t("settingsAdvanced.api.geminiKey.info"),
              key: "gemini-api-key",
              type: ConfigInput,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.exportImport.title"),
          subtitle: I18n.t("settingsAdvanced.exportImport.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.exportImport.export.label"),
              info: I18n.t("settingsAdvanced.exportImport.export.label"),
              key: "export-settings",
              text: I18n.t("settingsAdvanced.exportImport.export.button"),
              type: ConfigButton,
              onChange: async (_, event) => {
                const button = event?.target;
                if (!button) return;
                const originalText = button.textContent;
                button.textContent = I18n.t("settingsAdvanced.exportImport.export.processing");
                button.disabled = true;

                try {
                  const cfg = await StorageManager.exportConfig();
                  console.log("[Settings] Config before serialize:", cfg);
                  console.log("[Settings] Has track-sync-offsets:", "lyrics-plus:track-sync-offsets" in cfg);
                  const u8 = settingsObject.serialize(cfg);
                  // download as file
                  const blob = new Blob([u8], {
                    type: "application/octet-stream",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "lyrics-plus.lpconfig";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  const settingRow = button.closest(".setting-row");
                  let resultContainer = settingRow?.nextElementSibling;

                  if (
                    !resultContainer ||
                    !resultContainer.id ||
                    resultContainer.id !== "export-result-container"
                  ) {
                    // 결과 컨테이너가 없으면 생성
                    resultContainer = document.createElement("div");
                    resultContainer.id = "export-result-container";
                    resultContainer.style.cssText = "margin-top: -1px;";
                    settingRow?.parentNode?.insertBefore(
                      resultContainer,
                      settingRow.nextSibling
                    );
                  }

                  resultContainer.innerHTML = `<div style="
													padding: 16px 20px;
													background: rgba(255, 255, 255, 0.03);
													border: 1px solid rgba(96, 165, 250, 0.15);
													border-left: 1px solid rgba(255, 255, 255, 0.08);
													border-right: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom: 1px solid rgba(255, 255, 255, 0.08);
													backdrop-filter: blur(30px) saturate(150%);
													-webkit-backdrop-filter: blur(30px) saturate(150%);
												">
													<div style="
														display: flex;
														align-items: center;
														gap: 12px;
														color: rgba(96, 165, 250, 0.9);
														font-size: 13px;
													">
														<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
															<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
														</svg>
														<div>
															<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.exportSuccess")}</div>
															<div style="opacity: 0.8; font-size: 12px;">${I18n.t("notifications.exportSuccessDesc")}</div>
														</div>
													</div>
												</div>`;
                } catch (e) {
                  const settingRow = button.closest(".setting-row");
                  let resultContainer = settingRow?.nextElementSibling;

                  if (
                    !resultContainer ||
                    !resultContainer.id ||
                    resultContainer.id !== "export-result-container"
                  ) {
                    // 결과 컨테이너가 없으면 생성
                    resultContainer = document.createElement("div");
                    resultContainer.id = "export-result-container";
                    resultContainer.style.cssText = "margin-top: -1px;";
                    settingRow?.parentNode?.insertBefore(
                      resultContainer,
                      settingRow.nextSibling
                    );
                  }
                  resultContainer.innerHTML = `
											<div style="
												padding: 16px 20px;
												background: rgba(255, 255, 255, 0.03);
												border: 1px solid rgba(255, 107, 107, 0.2);
												border-left: 1px solid rgba(255, 255, 255, 0.08);
												border-right: 1px solid rgba(255, 255, 255, 0.08);
												border-bottom: 1px solid rgba(255, 255, 255, 0.08);
												backdrop-filter: blur(30px) saturate(150%);
												-webkit-backdrop-filter: blur(30px) saturate(150%);
											">
												<div style="
													display: flex;
													align-items: center;
													gap: 12px;
													color: rgba(255, 107, 107, 0.9);
													font-size: 13px;
													font-weight: 500;
												">
													<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
														<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
													</svg>
													<div>
														<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.exportFailed")}</div>
														<div style="opacity: 0.8; font-size: 12px;">${e.message || e.reason || e.toString()
                    }</div>
													</div>
												</div>
											</div>
										`;
                } finally {
                  button.textContent = originalText;
                  button.disabled = false;
                }
              },
            },

            {
              desc: I18n.t("settingsAdvanced.exportImport.import.label"),
              info: I18n.t("settingsAdvanced.exportImport.import.label"),
              key: "import-settings",
              text: I18n.t("settingsAdvanced.exportImport.import.button"),
              type: ConfigButton,
              onChange: async (_, event) => {
                const button = event?.target;
                if (!button) return;
                const originalText = button.textContent;
                button.textContent = I18n.t("settingsAdvanced.exportImport.import.processing");
                button.disabled = true;

                try {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = ".lpconfig,.json";
                  fileInput.onchange = async (e) => {
                    if (!fileInput.files || fileInput.files.length === 0) {
                      button.textContent = originalText;
                      button.disabled = false;
                      return;
                    }
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      const contents = e.target.result;
                      try {
                        // check file type
                        const fileType = file.type;
                        const isLpconfig =
                          !fileType && file.name.includes("lpconfig");
                        const isJson = fileType && fileType.includes("json");
                        if (!isLpconfig && !isJson) {
                          console.log(fileType);
                          console.log(file.name);
                          throw new Error("Invalid file type " + fileType);
                        }
                        if (isJson) {
                          const arraBuffer2Text = (ab) => {
                            return new TextDecoder("utf-8").decode(ab);
                          };
                          const cfg = JSON.parse(arraBuffer2Text(contents));
                          StorageManager.importConfig(cfg);
                        } else {
                          const u8 = new Uint8Array(contents);
                          const cfg = settingsObject.deserialize(u8);
                          StorageManager.importConfig(cfg);
                        }

                        const settingRow = button.closest(".setting-row");
                        let resultContainer = settingRow?.nextElementSibling;

                        if (
                          !resultContainer ||
                          !resultContainer.id ||
                          resultContainer.id !== "export-result-container"
                        ) {
                          // 결과 컨테이너가 없으면 생성
                          resultContainer = document.createElement("div");
                          resultContainer.id = "export-result-container";
                          resultContainer.style.cssText = "margin-top: -1px;";
                          settingRow?.parentNode?.insertBefore(
                            resultContainer,
                            settingRow.nextSibling
                          );
                        }

                        resultContainer.innerHTML = `<div style="
													padding: 16px 20px;
													background: rgba(255, 255, 255, 0.03);
													border: 1px solid rgba(96, 165, 250, 0.15);
													border-left: 1px solid rgba(255, 255, 255, 0.08);
													border-right: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom-left-radius: 12px;
													border-bottom-right-radius: 12px;
													backdrop-filter: blur(30px) saturate(150%);
													-webkit-backdrop-filter: blur(30px) saturate(150%);
												">
													<div style="
														display: flex;
														align-items: center;
														gap: 12px;
														color: rgba(96, 165, 250, 0.9);
														font-size: 13px;
													">
														<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
															<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
														</svg>
														<div>
															<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.importSuccess")}</div>
															<div style="opacity: 0.8; font-size: 12px;">${I18n.t("notifications.importSuccessDesc")}</div>
														</div>
													</div>
												</div>`;

                        // 1.5초 후 자동 새로고침
                        setTimeout(() => {
                          location.reload();
                        }, 1500);
                      } catch (e) {
                        const settingRow = button.closest(".setting-row");
                        let resultContainer = settingRow?.nextElementSibling;

                        if (
                          !resultContainer ||
                          !resultContainer.id ||
                          resultContainer.id !== "export-result-container"
                        ) {
                          // 결과 컨테이너가 없으면 생성
                          resultContainer = document.createElement("div");
                          resultContainer.id = "export-result-container";
                          resultContainer.style.cssText = "margin-top: -1px;";
                          settingRow?.parentNode?.insertBefore(
                            resultContainer,
                            settingRow.nextSibling
                          );
                        }
                        resultContainer.innerHTML = `
											<div style="
												padding: 16px 20px;
												background: rgba(255, 255, 255, 0.03);
												border: 1px solid rgba(255, 107, 107, 0.2);
												border-left: 1px solid rgba(255, 255, 255, 0.08);
												border-right: 1px solid rgba(255, 255, 255, 0.08);
												border-bottom: 1px solid rgba(255, 255, 255, 0.08);
												border-bottom-left-radius: 12px;
												border-bottom-right-radius: 12px;
												backdrop-filter: blur(30px) saturate(150%);
												-webkit-backdrop-filter: blur(30px) saturate(150%);
											">
												<div style="
													display: flex;
													align-items: center;
													gap: 12px;
													color: rgba(255, 107, 107, 0.9);
													font-size: 13px;
													font-weight: 500;
												">
													<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
														<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
													</svg>
													<div>
														<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.importFailed")}</div>
														<div style="opacity: 0.8; font-size: 12px;">${e.message || e.reason || e.toString()
                          }</div>
													</div>
												</div>
											</div>
										`;
                      } finally {
                        button.textContent = originalText;
                        button.disabled = false;
                      }
                    };
                    reader.readAsArrayBuffer(file);
                  };
                  document.body.appendChild(fileInput);
                  fileInput.click();
                  document.body.removeChild(fileInput);
                } catch (e) {
                  button.textContent = originalText;
                  button.disabled = false;
                }
              },
            },
          ],
          onChange: () => { },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.resetSettings.title"),
          subtitle: I18n.t("settingsAdvanced.resetSettings.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.resetSettings.reset.label"),
              info: I18n.t("settingsAdvanced.resetSettings.reset.desc"),
              key: "reset-settings",
              text: I18n.t("settingsAdvanced.resetSettings.reset.button"),
              type: ConfigButton,
              onChange: async (_, event) => {
                const button = event?.target;
                if (!button) return;

                // 확인 대화상자
                const confirmed = confirm(
                  I18n.t("settingsAdvanced.resetSettings.reset.confirm")
                );

                if (!confirmed) return;

                const originalText = button.textContent;
                button.textContent = I18n.t("settingsAdvanced.resetSettings.reset.processing");
                button.disabled = true;

                const settingRow = button.closest(".setting-row");
                let resultContainer = settingRow?.nextElementSibling;

                if (
                  !resultContainer ||
                  !resultContainer.id ||
                  resultContainer.id !== "reset-result-container"
                ) {
                  resultContainer = document.createElement("div");
                  resultContainer.id = "reset-result-container";
                  resultContainer.style.cssText = "margin-top: -1px;";
                  settingRow?.parentNode?.insertBefore(
                    resultContainer,
                    settingRow.nextSibling
                  );
                }

                try {
                  // localStorage에서 lyrics-plus 관련 모든 항목 제거
                  const keysToRemove = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith("lyrics-plus:")) {
                      keysToRemove.push(key);
                    }
                  }

                  keysToRemove.forEach((key) => {
                    localStorage.removeItem(key);
                  });

                  resultContainer.innerHTML = `<div style="
													padding: 16px 20px;
													background: rgba(255, 255, 255, 0.03);
													border: 1px solid rgba(96, 165, 250, 0.15);
													border-left: 1px solid rgba(255, 255, 255, 0.08);
													border-right: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom-left-radius: 12px;
													border-bottom-right-radius: 12px;
													backdrop-filter: blur(30px) saturate(150%);
													-webkit-backdrop-filter: blur(30px) saturate(150%);
												">
													<div style="
														display: flex;
														align-items: center;
														gap: 12px;
														color: rgba(96, 165, 250, 0.9);
														font-size: 13px;
													">
														<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
															<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
														</svg>
														<div>
															<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.resetSuccess")}</div>
															<div style="opacity: 0.8; font-size: 12px;">${I18n.t("notifications.importSuccessDesc")}</div>
														</div>
													</div>
												</div>`;

                  // 1.5초 후 자동 새로고침
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                } catch (e) {
                  resultContainer.innerHTML = `
											<div style="
												padding: 16px 20px;
												background: rgba(255, 255, 255, 0.03);
												border: 1px solid rgba(255, 107, 107, 0.2);
												border-left: 1px solid rgba(255, 255, 255, 0.08);
												border-right: 1px solid rgba(255, 255, 255, 0.08);
												border-bottom: 1px solid rgba(255, 255, 255, 0.08);
												border-bottom-left-radius: 12px;
												border-bottom-right-radius: 12px;
												backdrop-filter: blur(30px) saturate(150%);
												-webkit-backdrop-filter: blur(30px) saturate(150%);
											">
												<div style="
													display: flex;
													align-items: center;
													gap: 12px;
													color: rgba(255, 107, 107, 0.9);
													font-size: 13px;
													font-weight: 500;
												">
													<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
														<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
													</svg>
													<div>
														<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.resetFailed")}</div>
														<div style="opacity: 0.8; font-size: 12px;">${e.message || e.reason || e.toString()
                    }</div>
													</div>
												</div>
											</div>
										`;

                  button.textContent = originalText;
                  button.disabled = false;
                }
              },
            },
          ],
          onChange: () => { },
        })
      ),
      // 전체화면 탭
      react.createElement(
        "div",
        {
          className: `tab-content ${activeTab === "fullscreen" ? "active" : ""}`,
        },
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.fullscreenMode.title"),
          subtitle: I18n.t("settingsAdvanced.fullscreenMode.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.playback.fullscreenShortcut.label"),
              info: I18n.t("settingsAdvanced.fullscreenMode.shortcut.info"),
              key: "fullscreen-key",
              type: ConfigHotkey,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenMode.twoColumnLayout.desc"),
              info: I18n.t("settingsAdvanced.fullscreenMode.splitView.info"),
              key: "fullscreen-two-column",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-two-column"] ?? true,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenMode.invertPosition.desc"),
              info: I18n.t("settingsAdvanced.fullscreenMode.invertPosition.info"),
              key: "fullscreen-layout-reverse",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-layout-reverse"] ?? false,
              when: () => CONFIG.visual["fullscreen-two-column"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenMode.showAlbumArt.desc"),
              info: I18n.t("settingsAdvanced.fullscreenMode.showAlbumArt.info"),
              key: "fullscreen-show-album",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-album"] ?? true,
              when: () => CONFIG.visual["fullscreen-two-column"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenMode.showTrackInfo.desc"),
              info: I18n.t("settingsAdvanced.fullscreenMode.showTrackInfo.info"),
              key: "fullscreen-show-info",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-info"] ?? true,
              when: () => CONFIG.visual["fullscreen-two-column"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenMode.centerWhenNoLyrics.desc"),
              info: I18n.t("settingsAdvanced.fullscreenMode.centerWhenNoLyrics.info"),
              key: "fullscreen-center-when-no-lyrics",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-center-when-no-lyrics"] ?? true,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.fullscreenStyle.title"),
          subtitle: I18n.t("settingsAdvanced.fullscreenStyle.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.fullscreenStyle.albumSize.desc"),
              info: I18n.t("settingsAdvanced.fullscreenStyle.albumSize.info"),
              key: "fullscreen-album-size",
              type: ConfigSliderRange,
              min: 100,
              max: 500,
              step: 10,
              unit: "px",
              defaultValue: CONFIG.visual["fullscreen-album-size"] || 400,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenStyle.albumRadius.desc"),
              info: I18n.t("settingsAdvanced.fullscreenStyle.albumRadius.info"),
              key: "fullscreen-album-radius",
              type: ConfigSliderRange,
              min: 0,
              max: 50,
              step: 1,
              unit: "px",
              defaultValue: CONFIG.visual["fullscreen-album-radius"] || 12,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenStyle.titleFontSize.desc"),
              info: I18n.t("settingsAdvanced.fullscreenStyle.titleFontSize.info"),
              key: "fullscreen-title-size",
              type: ConfigSliderRange,
              min: 24,
              max: 72,
              step: 2,
              unit: "px",
              defaultValue: CONFIG.visual["fullscreen-title-size"] || 48,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenStyle.artistFontSize.desc"),
              info: I18n.t("settingsAdvanced.fullscreenStyle.artistFontSize.info"),
              key: "fullscreen-artist-size",
              type: ConfigSliderRange,
              min: 14,
              max: 36,
              step: 1,
              unit: "px",
              defaultValue: CONFIG.visual["fullscreen-artist-size"] || 24,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenStyle.lyricsRightMargin.desc"),
              info: I18n.t("settingsAdvanced.fullscreenStyle.lyricsRightMargin.info"),
              key: "fullscreen-lyrics-right-padding",
              type: ConfigSliderRange,
              min: 0,
              max: 300,
              step: 10,
              unit: "px",
              defaultValue: CONFIG.visual["fullscreen-lyrics-right-padding"] || 0,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.fullscreenUI.title"),
          subtitle: I18n.t("settingsAdvanced.fullscreenUI.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showClock.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showClock.info"),
              key: "fullscreen-show-clock",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-clock"] ?? true,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.clockSize.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.clockSize.info"),
              key: "fullscreen-clock-size",
              type: ConfigSliderRange,
              min: 24,
              max: 72,
              step: 2,
              unit: "px",
              defaultValue: CONFIG.visual["fullscreen-clock-size"] || 48,
              when: () => CONFIG.visual["fullscreen-show-clock"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showContext.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showContext.info"),
              key: "fullscreen-show-context",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-context"] ?? true,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showContextImage.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showContextImage.info"),
              key: "fullscreen-show-context-image",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-context-image"] ?? true,
              when: () => CONFIG.visual["fullscreen-show-context"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showNextTrack.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showNextTrack.info"),
              key: "fullscreen-show-next-track",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-next-track"] ?? true,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.nextTrackTime.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.nextTrackTime.info"),
              key: "fullscreen-next-track-seconds",
              type: ConfigSliderRange,
              min: 5,
              max: 30,
              step: 1,
              unit: I18n.t("settingsAdvanced.fullscreenUI.nextTrackTime.unit"),
              defaultValue: CONFIG.visual["fullscreen-next-track-seconds"] || 15,
              when: () => CONFIG.visual["fullscreen-show-next-track"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showControls.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showControls.info"),
              key: "fullscreen-show-controls",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-controls"] ?? true,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showVolume.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showVolume.info"),
              key: "fullscreen-show-volume",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-volume"] ?? true,
              when: () => CONFIG.visual["fullscreen-show-controls"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showProgressBar.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showProgressBar.info"),
              key: "fullscreen-show-progress",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-progress"] ?? true,
              when: () => CONFIG.visual["fullscreen-show-controls"] !== false,
            },
            {
              desc: I18n.t("settingsAdvanced.fullscreenUI.showLyricsProgress.desc"),
              info: I18n.t("settingsAdvanced.fullscreenUI.showLyricsProgress.info"),
              key: "fullscreen-show-lyrics-progress",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-show-lyrics-progress"] ?? false,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.controllerStyle.title"),
          subtitle: I18n.t("settingsAdvanced.controllerStyle.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.controllerStyle.buttonSize.desc"),
              info: I18n.t("settingsAdvanced.controllerStyle.buttonSize.info"),
              key: "fullscreen-control-button-size",
              type: ConfigSliderRange,
              min: 28,
              max: 48,
              step: 2,
              unit: "px",
              defaultValue: CONFIG.visual["fullscreen-control-button-size"] || 36,
            },
            {
              desc: I18n.t("settingsAdvanced.controllerStyle.background.desc"),
              info: I18n.t("settingsAdvanced.controllerStyle.background.info"),
              key: "fullscreen-controls-background",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-controls-background"] ?? false,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        }),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.autoHide.title"),
          subtitle: I18n.t("settingsAdvanced.autoHide.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.autoHide.enabled.desc"),
              info: I18n.t("settingsAdvanced.autoHide.enabled.info"),
              key: "fullscreen-auto-hide-ui",
              type: ConfigSlider,
              defaultValue: CONFIG.visual["fullscreen-auto-hide-ui"] ?? true,
            },
            {
              desc: I18n.t("settingsAdvanced.autoHide.delay.desc"),
              info: I18n.t("settingsAdvanced.autoHide.delay.info"),
              key: "fullscreen-auto-hide-delay",
              type: ConfigSliderRange,
              min: 1,
              max: 10,
              step: 0.5,
              unit: I18n.t("settingsAdvanced.fullscreenUI.nextTrackTime.unit"),
              defaultValue: CONFIG.visual["fullscreen-auto-hide-delay"] || 3,
              when: () => CONFIG.visual["fullscreen-auto-hide-ui"] !== false,
            },
          ],
          onChange: (name, value) => {
            CONFIG.visual[name] = value;
            StorageManager.saveConfig(name, value);
            lyricContainerUpdate?.();
            window.dispatchEvent(
              new CustomEvent("lyrics-plus", {
                detail: { type: "config", name, value },
              })
            );
          },
        })
      ),
      // 정보 탭
      react.createElement(
        "div",
        {
          className: `tab-content ${activeTab === "about" ? "active" : ""}`,
        },
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.aboutTab.appInfo.title"),
          subtitle: I18n.t("settingsAdvanced.aboutTab.subtitle"),
        }),
        react.createElement(
          "div",
          {
            className: "info-card",
            style: {
              padding: "20px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "0 0 12px 12px",
              backdropFilter: "blur(30px) saturate(150%)",
              WebkitBackdropFilter: "blur(30px) saturate(150%)",
              marginBottom: "24px",
            },
          },
          react.createElement(
            "h3",
            {
              style: {
                margin: "0 0 12px",
                fontSize: "18px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              },
            },
            react.createElement("span", null, "🎵"),
            "Lyrics Plus"
          ),
          react.createElement(
            "p",
            {
              style: {
                margin: "0 0 16px",
                color: "rgba(255,255,255,0.7)",
                lineHeight: "1.6",
              },
            },
            I18n.t("settingsAdvanced.aboutTab.appDescription")
          ),
          react.createElement(
            "p",
            {
              style: {
                margin: "0 0 8px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
              },
            },
            `${I18n.t("settingsAdvanced.aboutTab.versionPrefix")}: ${Utils.currentVersion}`
          ),
          react.createElement("div", {
            style: {
              height: "1px",
              background: "rgba(255, 255, 255, 0.1)",
              margin: "16px 0",
            },
          }),
          react.createElement(
            "p",
            {
              style: {
                margin: "0 0 12px",
                color: "rgba(255,255,255,0.9)",
                lineHeight: "1.6",
              },
            },
            react.createElement("strong", null, I18n.t("settingsAdvanced.aboutTab.developer")),
            " ivLis Studio"
          ),
          react.createElement(
            "p",
            {
              style: {
                margin: "0 0 12px",
                color: "rgba(255,255,255,0.9)",
                lineHeight: "1.6",
              },
            },
            react.createElement("strong", null, I18n.t("settingsAdvanced.aboutTab.originalProject")),
            " lyrics-plus by khanhas"
          ),
          react.createElement(
            "p",
            {
              style: {
                margin: "0",
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                lineHeight: "1.6",
              },
            },
            I18n.t("settingsAdvanced.aboutTab.thanks")
          )
        ),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.aboutTab.clientInfo.title"),
          subtitle: I18n.t("settingsAdvanced.aboutTab.clientInfo.subtitle"),
        }),
        react.createElement(
          "div",
          {
            className: "info-card",
            style: {
              padding: "20px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "0 0 12px 12px",
              backdropFilter: "blur(30px) saturate(150%)",
              WebkitBackdropFilter: "blur(30px) saturate(150%)",
              marginBottom: "24px",
            },
          },
          react.createElement(
            "p",
            {
              style: {
                margin: "0 0 8px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "13px",
                lineHeight: "1.6",
              },
            },
            I18n.t("settingsAdvanced.aboutTab.clientInfo.description"),
          ),
          react.createElement(
            "div",
            {
              style: {
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              },
            },
            react.createElement(
              "div",
              {
                style: {
                  flex: 1,
                  background: "rgba(0, 0, 0, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.9)",
                  userSelect: "all",
                  wordBreak: "break-all",
                  lineHeight: "1.5",
                },
              },
              StorageManager.getClientId()
            ),
            react.createElement(
              "button",
              {
                onClick: () => {
                  const clientId = StorageManager.getClientId();
                  navigator.clipboard.writeText(clientId).then(() => {
                    Spicetify.showNotification(I18n.t("settingsAdvanced.aboutTab.clientInfo.copied"), false, 2000);
                  }).catch(() => {
                    Spicetify.showNotification(I18n.t("settingsAdvanced.aboutTab.clientInfo.copyFailed"), true, 2000);
                  });
                },
                style: {
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "rgba(255, 255, 255, 0.9)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                },
                onMouseEnter: (e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.12)";
                },
                onMouseLeave: (e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.08)";
                },
              },
              I18n.t("settingsAdvanced.aboutTab.clientInfo.copy")
            )
          )
        ),
        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.aboutTab.update.title"),
          subtitle: I18n.t("settingsAdvanced.aboutTab.update.subtitle"),
        }),
        react.createElement(OptionList, {
          items: [
            {
              desc: I18n.t("settingsAdvanced.aboutTab.update.checkUpdate.desc"),
              info: I18n.t("settingsAdvanced.update.currentVersionInfo").replace("{version}", Utils.currentVersion),
              key: "check-update",
              text: I18n.t("settingsAdvanced.aboutTab.update.checkUpdate.button"),
              type: ConfigButton,
              onChange: async (_, event) => {
                const button = event?.target;
                if (!button) return;
                const originalText = button.textContent;
                button.textContent = I18n.t("settingsAdvanced.aboutTab.update.checkUpdate.checking");
                button.disabled = true;

                // setting-row 다음에 결과 컨테이너 찾기/생성
                const settingRow = button.closest(".setting-row");
                let resultContainer = settingRow?.nextElementSibling;

                if (
                  !resultContainer ||
                  !resultContainer.id ||
                  resultContainer.id !== "update-result-container"
                ) {
                  // 결과 컨테이너가 없으면 생성
                  resultContainer = document.createElement("div");
                  resultContainer.id = "update-result-container";
                  resultContainer.style.cssText = "margin-top: -1px;";
                  settingRow?.parentNode?.insertBefore(
                    resultContainer,
                    settingRow.nextSibling
                  );
                }

                if (resultContainer) resultContainer.innerHTML = "";

                try {
                  const updateInfo = await Utils.checkForUpdates();

                  if (resultContainer) {
                    let message,
                      showUpdateSection = false,
                      showCopyButton = false;
                    const platform = Utils.detectPlatform();
                    const platformName = Utils.getPlatformName();
                    const installCommand = Utils.getInstallCommand();

                    if (updateInfo.error) {
                      message = I18n.t("settingsAdvanced.update.checkFailedWithError").replace("{error}", updateInfo.error);
                      resultContainer.innerHTML = `
												<div style="
													padding: 16px 20px;
													background: rgba(255, 255, 255, 0.03);
													border: 1px solid rgba(255, 107, 107, 0.2);
													border-left: 1px solid rgba(255, 255, 255, 0.08);
													border-right: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom-left-radius: 12px;
													border-bottom-right-radius: 12px;
													backdrop-filter: blur(30px) saturate(150%);
													-webkit-backdrop-filter: blur(30px) saturate(150%);
												">
													<div style="
														display: flex;
														align-items: center;
														gap: 12px;
														color: rgba(255, 107, 107, 0.9);
														font-size: 13px;
														font-weight: 500;
													">
														<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
															<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
														</svg>
														<div>
															<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.updateCheckFailed")}</div>
															<div style="opacity: 0.8; font-size: 12px;">${I18n.t("notifications.checkNetworkConnection")}</div>
														</div>
													</div>
												</div>
											`;
                    } else if (updateInfo.hasUpdate) {
                      showUpdateSection = true;
                      showCopyButton = true;

                      resultContainer.innerHTML = `
												<div style="
													padding: 20px;
													background: rgba(255, 255, 255, 0.04);
													border: 1px solid rgba(74, 222, 128, 0.15);
													border-left: 1px solid rgba(255, 255, 255, 0.08);
													border-right: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom-left-radius: 12px;
													border-bottom-right-radius: 12px;
													backdrop-filter: blur(30px) saturate(150%);
													-webkit-backdrop-filter: blur(30px) saturate(150%);
												">
													<div style="margin-bottom: 16px;">
														<div style="
															display: flex;
															align-items: center;
															gap: 12px;
															margin-bottom: 12px;
														">
															<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(74, 222, 128, 0.9)" stroke-width="2">
																<circle cx="12" cy="12" r="10"/>
																<path d="M12 6v6l4 2"/>
															</svg>
															<div>
																<div style="
																	font-size: 14px;
																	font-weight: 600;
																	color: rgba(255, 255, 255, 0.95);
																	margin-bottom: 2px;
																	letter-spacing: -0.01em;
																">${I18n.t("notifications.updateAvailable")}</div>
																<div style="
																	font-size: 12px;
																	color: rgba(255, 255, 255, 0.5);
																">${I18n.t("update.versionChange")} ${updateInfo.currentVersion} → ${updateInfo.latestVersion}</div>
															</div>
														</div>
													</div>
													
													<div style="
														background: rgba(0, 0, 0, 0.25);
														border: 1px solid rgba(255, 255, 255, 0.08);
														border-radius: 8px;
														padding: 12px 14px;
														margin-bottom: 12px;
													">
														<div style="
															font-size: 12px;
															color: rgba(255, 255, 255, 0.6);
															margin-bottom: 8px;
															font-weight: 500;
														">${platformName}</div>
														<code style="
															font-family: Consolas, Monaco, 'Courier New', monospace;
															font-size: 12px;
															color: rgba(255, 255, 255, 0.85);
															word-break: break-all;
															line-height: 1.6;
															user-select: all;
														">${installCommand}</code>
													</div>
													
													<div style="display: flex; gap: 8px;">
														<button id="copy-install-command-btn" style="
															flex: 1;
															background: rgba(255, 255, 255, 0.1);
															border: 1px solid rgba(255, 255, 255, 0.15);
															color: rgba(255, 255, 255, 0.9);
															padding: 10px 16px;
															border-radius: 8px;
															cursor: pointer;
															font-size: 13px;
															font-weight: 600;
															transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
															letter-spacing: -0.01em;
														">${I18n.t("update.copyCommand")}</button>
														<a href="https://github.com/ivLis-Studio/lyrics-plus/releases/tag/v${updateInfo.latestVersion}" 
														   target="_blank"
														   style="
															flex: 1;
															background: rgba(255, 255, 255, 0.08);
															border: 1px solid rgba(255, 255, 255, 0.15);
															color: rgba(255, 255, 255, 0.9);
															padding: 10px 16px;
															border-radius: 8px;
															text-decoration: none;
															font-size: 13px;
															font-weight: 600;
															transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
															display: flex;
															align-items: center;
															justify-content: center;
															letter-spacing: -0.01em;
														">${I18n.t("update.releaseNotes")}</a>
													</div>
												</div>
											`;

                      // Add copy button handler
                      const copyBtn = resultContainer.querySelector(
                        "#copy-install-command-btn"
                      );
                      if (copyBtn) {
                        copyBtn.addEventListener("click", async () => {
                          const success = await Utils.copyToClipboard(
                            installCommand
                          );
                          if (success) {
                            copyBtn.textContent = I18n.t("settingsAdvanced.aboutTab.update.copied");
                            copyBtn.style.background =
                              "rgba(16, 185, 129, 0.15)";
                            copyBtn.style.border =
                              "1px solid rgba(16, 185, 129, 0.3)";
                            copyBtn.style.color = "rgba(16, 185, 129, 1)";
                            copyBtn.style.cursor = "default";
                            copyBtn.disabled = true;
                            Spicetify.showNotification(
                              I18n.t("settingsAdvanced.aboutTab.update.installCopied")
                            );
                          } else {
                            Spicetify.showNotification(
                              I18n.t("settingsAdvanced.aboutTab.update.copyFailed"),
                              true
                            );
                          }
                        });
                      }
                    } else {
                      resultContainer.innerHTML = `
												<div style="
													padding: 16px 20px;
													background: rgba(255, 255, 255, 0.03);
													border: 1px solid rgba(96, 165, 250, 0.15);
													border-left: 1px solid rgba(255, 255, 255, 0.08);
													border-right: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom: 1px solid rgba(255, 255, 255, 0.08);
													border-bottom-left-radius: 12px;
													border-bottom-right-radius: 12px;
													backdrop-filter: blur(30px) saturate(150%);
													-webkit-backdrop-filter: blur(30px) saturate(150%);
												">
													<div style="
														display: flex;
														align-items: center;
														gap: 12px;
														color: rgba(96, 165, 250, 0.9);
														font-size: 13px;
													">
														<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
															<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
														</svg>
														<div>
															<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.latestVersion")}</div>
															<div style="opacity: 0.8; font-size: 12px;">${I18n.t("update.versionChange")} ${updateInfo.currentVersion}</div>
														</div>
													</div>
												</div>
											`;
                    }
                  }
                } catch (error) {
                  if (resultContainer) {
                    resultContainer.innerHTML = `
											<div style="
												padding: 16px 20px;
												background: rgba(255, 255, 255, 0.03);
												border: 1px solid rgba(255, 107, 107, 0.2);
												border-left: 1px solid rgba(255, 255, 255, 0.08);
												border-right: 1px solid rgba(255, 255, 255, 0.08);
												border-bottom: 1px solid rgba(255, 255, 255, 0.08);
												border-bottom-left-radius: 12px;
												border-bottom-right-radius: 12px;
												backdrop-filter: blur(30px) saturate(150%);
												-webkit-backdrop-filter: blur(30px) saturate(150%);
											">
												<div style="
													display: flex;
													align-items: center;
													gap: 12px;
													color: rgba(255, 107, 107, 0.9);
													font-size: 13px;
													font-weight: 500;
												">
													<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
														<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
													</svg>
													<div>
														<div style="font-weight: 600; margin-bottom: 2px;">${I18n.t("notifications.updateCheckFailed")}</div>
														<div style="opacity: 0.8; font-size: 12px;">${I18n.t("notifications.checkNetworkConnection")}</div>
													</div>
												</div>
											</div>
										`;
                  }
                } finally {
                  button.textContent = originalText;
                  button.disabled = false;
                }
              },
            },
          ],
          onChange: () => { },
        }),

        react.createElement(SectionTitle, {
          title: I18n.t("settingsAdvanced.aboutTab.patchNotes.title"),
          subtitle: I18n.t("settingsAdvanced.aboutTab.patchNotes.subtitle"),
        }),
        react.createElement(
          "div",
          {
            id: "patch-notes-container",
            style: {
              padding: "20px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "0 0 12px 12px",
              backdropFilter: "blur(30px) saturate(150%)",
              WebkitBackdropFilter: "blur(30px) saturate(150%)",
              marginBottom: "24px",
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
            },
          },
          I18n.t("settingsAdvanced.aboutTab.patchNotes.loading")
        )
      )
    )
  );
};

function openConfig() {
  const configContainer = react.createElement(ConfigModal);

  // Create a full-screen overlay instead of nested modal
  const overlay = document.createElement("div");
  overlay.id = "lyrics-plus-settings-overlay";
  overlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.2);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(20px) saturate(120%);
		-webkit-backdrop-filter: blur(5px) saturate(120%);
	`;

  const modalContainer = document.createElement("div");
  modalContainer.style.cssText = `
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(60px) saturate(200%) brightness(1.1);
		-webkit-backdrop-filter: blur(60px) saturate(200%) brightness(1.1);
		border-radius: 16px;
		max-width: 90vw;
		max-height: 90vh;
		width: 800px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1) inset;
		border: 1px solid rgba(255, 255, 255, 0.1);
	`;

  // Close on outside click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      document.body.removeChild(overlay);
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  overlay.appendChild(modalContainer);
  document.body.appendChild(overlay);

  // Render React component
  const dom =
    window.lyricsPlusEnsureReactDOM?.() ||
    (typeof reactDOM !== "undefined"
      ? reactDOM
      : window.Spicetify?.ReactDOM ?? window.ReactDOM ?? null);
  if (!dom?.render) {
    return;
  }
  dom.render(configContainer, modalContainer);
}

// 언어 변경 후 자동으로 설정 페이지 열기
(function checkReturnToSettings() {
  const shouldReturn = localStorage.getItem("lyrics-plus:return-to-settings");
  if (shouldReturn === "true") {
    localStorage.removeItem("lyrics-plus:return-to-settings");
    // DOM이 준비된 후 설정 열기
    const tryOpenSettings = () => {
      if (typeof openConfig === "function" && document.body) {
        // 약간의 지연을 두고 설정 열기
        setTimeout(() => {
          openConfig();
        }, 500);
      } else {
        setTimeout(tryOpenSettings, 100);
      }
    };
    tryOpenSettings();
  }
})();
