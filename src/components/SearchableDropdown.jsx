import React, { useState, useEffect, useRef } from 'react';
import '../styles/SearchableDropdown.css';

const SearchableDropdown = ({ options, label, id, selectedVal, handleChange, placeholder }) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Sync internal query with selectedVal if it changes externally
        if (selectedVal) {
            setQuery(selectedVal);
        } else if (selectedVal === '') {
            setQuery('');
        }
    }, [selectedVal]);

    useEffect(() => {
        // Handle clicking outside to close
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleClickOutside = (e) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(e.target) &&
            inputRef.current &&
            !inputRef.current.contains(e.target)
        ) {
            setIsOpen(false);
        }
    };

    const filterOptions = (options) => {
        return options.filter(
            (option) =>
                option.name.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
                (option.dealer_id && option.dealer_id.toString().indexOf(query) > -1)
        );
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        handleChange(e.target.value); // Determine if we want to pass raw text or wait for selection
        setIsOpen(true);
    };

    const handleSelect = (option) => {
        setQuery(option.name);
        handleChange(option.name); // Pass selected name back to parent
        setIsOpen(false);
    };

    const filtered = filterOptions(options);

    return (
        <div className="searchable-dropdown">
            <div className="input-group input-group-sm" ref={inputRef}>
                <input
                    id={id}
                    name={`search_dropdown_${id}`}
                    type="text"
                    value={query}
                    className="form-control"
                    onChange={handleInputChange}
                    onClick={() => setIsOpen(true)} // Open on click
                    placeholder={placeholder || "Search..."}
                    autoComplete="new-password"
                    list="autocompleteOff"
                />
                <label className="input-group-text bg-white border-start-0">
                    <i className="bi bi-chevron-down"></i>
                </label>
            </div>

            {isOpen && (
                <ul className="dropdown-options" ref={dropdownRef}>
                    {filtered.length > 0 ? (
                        filtered.map((option, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(option)}
                                className="dropdown-option"
                            >
                                <div className="fw-bold">{option.name}</div>
                                {option.dealer_id && <small className="text-muted">ID: {option.dealer_id}</small>}
                            </li>
                        ))
                    ) : (
                        <li className="dropdown-option no-results">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableDropdown;
