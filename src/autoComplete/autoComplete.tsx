import React, {useEffect, useRef, useState} from "react";
import {countriesDials} from "../utils/countriesData";
import "./autoComplete.scss"
import {FocusState} from "../utils/enums";
import {CountryInterface} from "../utils/interfaces";

const AutoComplete:React.FC = () => {
    const [state, setState] = useState({
        filteredList: countriesDials,
        focusState: FocusState.BLUR,
        hoveredOptionID: "",
        value: ""
    })
    const filteredListRef = useRef<Array<CountryInterface>>(countriesDials)
    const focusStateRef = useRef<FocusState>(FocusState.BLUR)
    const selectedItemRef = useRef<CountryInterface | undefined>(undefined)
    const hoveredOptionIdRef = useRef<string>("")
    const valueRef = useRef<string>("")
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const checkClick = (event: MouseEvent) => {
            if(listRef.current && inputRef.current) {
                if(inputRef.current.contains(event.target as Node)) {
                    onFocusOrBlur(FocusState.FOCUS)
                } else if (!listRef.current.contains(event.target as Node)) {
                    onFocusOrBlur(FocusState.BLUR)
                }
            }
        }

        document.addEventListener("click", checkClick)

        return () => {
            document.removeEventListener("click", checkClick)
        }
    }, [])

    const onFocusOrBlur = (event: FocusState) => {
        focusStateRef.current = event;
        configureList();
    }

    const configureList = () => {
        if (focusStateRef.current === FocusState.FOCUS) {
            document.addEventListener('keydown', initKeyboardListeners)
            filteredListRef.current = countriesDials.filter(
                item => item.name.toLowerCase().includes(valueRef.current.toLowerCase().trim())
            )
        } else {
            document.removeEventListener('keydown', initKeyboardListeners)
            filteredListRef.current = [...countriesDials]
            hoveredOptionIdRef.current = selectedItemRef.current?.isoCode || ""
        }
        updateDom()
    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>  {
        filteredListRef.current = countriesDials.filter(
            item => item.name.toLowerCase().includes(event.target.value.toLowerCase().trim())
        )
        valueRef.current = event.target.value.trim()
        if (valueRef.current === "") {
            hoveredOptionIdRef.current = ""
        }
        updateDom()
    }

    const selectedCountry = (item: CountryInterface) => {
        selectedItemRef.current = item;
        valueRef.current = selectedItemRef.current?.name || ""
        filteredListRef.current = countriesDials.filter(
            item => item.name.toLowerCase().includes(valueRef.current.toLowerCase().trim())
        )
        focusStateRef.current = FocusState.BLUR
        updateDom()
    }

    const onMouseEnter = (item: CountryInterface) => {
        hoveredOptionIdRef.current = item.isoCode
        updateDom()
    }

    const initKeyboardListeners = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowUp":
                changeHoveredItem(-1)
                break;
            case "ArrowDown":
                changeHoveredItem(1)
                break;
            case "Enter":
                selectedCountry(countriesDials.find(item => item.isoCode === hoveredOptionIdRef.current) as CountryInterface)
                break;
            default:
                break;
        }
    }

    const changeHoveredItem = (acc: number) => {
        const index = filteredListRef.current.findIndex(item => item.isoCode === hoveredOptionIdRef.current) + acc;
        if ( index < 0) {
            hoveredOptionIdRef.current = filteredListRef.current[filteredListRef.current.length - 1]?.isoCode
        } else if (index > filteredListRef.current.length) {
            hoveredOptionIdRef.current = filteredListRef.current[0]?.isoCode
        } else {
            hoveredOptionIdRef.current = filteredListRef.current[index]?.isoCode
        }
        document.getElementById(hoveredOptionIdRef.current)?.scrollIntoView({block: "center", inline: "center"})
        updateDom()
    }

    const updateDom = () => {
        setState({
            filteredList: filteredListRef.current,
            value: valueRef.current,
            hoveredOptionID: hoveredOptionIdRef.current,
            focusState: focusStateRef.current
        })
    }

    return (
        <div className={"autoCompleteMainContainer"}>
            <input
                ref={inputRef}
                onChange={onChange}
                value={state.value}
                placeholder={"Enter your country"}
            />
            <div ref={listRef} className={`list ${state.focusState === FocusState.FOCUS}`}>
                {
                    state.filteredList.map((item, index) => (
                        <div
                            onClick={() => selectedCountry(item)}
                            key={index}
                            id={item.isoCode}
                            className={`listItem ${state.hoveredOptionID === item.isoCode}`}
                            onMouseEnter={() => onMouseEnter(item)}
                        >
                            <img src={item.flag} alt={item.name}/>
                            <span>{item.name}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default AutoComplete