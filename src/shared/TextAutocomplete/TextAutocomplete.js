"use client";

import { useId, useMemo, useState } from "react";
import { fuzzyFilter, normalizeText } from "./fuzzyTextSearch.mjs";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

export default function TextAutocomplete({
  id,
  label,
  value,
  onChange,
  onSelect,
  onClear,
  options,
  getOptionLabel,
  getSearchValues = (option) => [getOptionLabel(option)],
  getOptionKey = getOptionLabel,
  renderOption = getOptionLabel,
  selectedKey = "",
  placeholder,
  maxResults = 12,
  promptText = "Escribe para iniciar la búsqueda.",
  emptyText = "No se encontraron coincidencias.",
  classNames = {},
}) {
  const generatedId = useId();
  const inputId = id || `autocomplete-${generatedId}`;
  const listId = `${inputId}-options`;
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedValue = useMemo(() => normalizeText(value), [value]);
  const matches = useMemo(
    () => fuzzyFilter(options, value, getSearchValues, maxResults),
    [options, value, getSearchValues, maxResults]
  );

  const selectOption = (option) => {
    onChange(getOptionLabel(option));
    onSelect(option);
  };

  const handleKeyDown = (event) => {
    if (!matches.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        if (current < 0) return direction > 0 ? 0 : matches.length - 1;
        return (current + direction + matches.length) % matches.length;
      });
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectOption(matches[activeIndex]);
    }

    if (event.key === "Escape") setActiveIndex(-1);
  };

  const clear = () => {
    setActiveIndex(-1);
    onChange("");
    onClear?.();
  };

  return (
    <div className={classNames.root}>
      {label && (
        <label className={classNames.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={classNames.inputWrapper}>
        <input
          id={inputId}
          className={classNames.input}
          value={value}
          onChange={(event) => {
            setActiveIndex(-1);
            onChange(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={normalizedValue.length > 0}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
        />

        {value.length > 0 && (
          <button
            type="button"
            className={classNames.clearButton}
            onClick={clear}
            aria-label="Limpiar búsqueda"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      <div id={listId} className={classNames.list} role="listbox">
        {normalizedValue && matches.length > 0 ? (
          matches.map((option, index) => {
            const key = getOptionKey(option);
            const isSelected = key === selectedKey;
            const isActive = index === activeIndex;

            return (
              <button
                id={`${listId}-${index}`}
                key={key}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={joinClasses(
                  classNames.option,
                  isSelected && classNames.selectedOption,
                  isActive && classNames.activeOption
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
              >
                {renderOption(option)}
              </button>
            );
          })
        ) : (
          <p className={classNames.empty}>
            {normalizedValue ? emptyText : promptText}
          </p>
        )}
      </div>
    </div>
  );
}
