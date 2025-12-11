import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/SearchableDropdown.css';

const SearchableDropdown = ({ options, label, id, selectedVal, handleChange, placeholder }) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (selectedVal) {
            setQuery(selectedVal);
        } else if (selectedVal === '') {
            setQuery('');
        }
    }, [selectedVal]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Update coordinates when opening or resizing/scrolling
    const updateCoords = () => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setCoords({
                left: rect.left + window.scrollX,
                top: rect.bottom + window.scrollY,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            // Optional: update on scroll/resize to keep it attached
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, true);
        }
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen]);

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
        handleChange(e.target.value);
        setIsOpen(true);
    };

    const handleSelect = (option) => {
        setQuery(option.name);
        handleChange(option.name);
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
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder || "Search..."}
                    autoComplete="off"
                />
                <label className="input-group-text bg-white border-start-0">
                    <i className="bi bi-chevron-down"></i>
                </label>
            </div>

            {isOpen && createPortal(
                <ul
                    className="dropdown-options"
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        left: coords.left,
                        top: coords.top,
                        width: coords.width,
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
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
                </ul>,
                document.body
            )}
        </div>
    );
};

export default SearchableDropdown;
