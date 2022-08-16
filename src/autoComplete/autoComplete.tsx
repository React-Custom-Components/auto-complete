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

    useEffect(() => {
        const inputRef = document.getElementById("UNIQUE_ID")

        if (inputRef) {
            inputRef.addEventListener("focus", onFocusOrBlur)
            inputRef.addEventListener("blur", onFocusOrBlur)
        }

        return () => {
            if (inputRef) {
                inputRef.removeEventListener("focus", onFocusOrBlur)
                inputRef.removeEventListener("blur", onFocusOrBlur)
            }
        }

    }, [])

    const onFocusOrBlur = (event: FocusEvent) => {
        focusStateRef.current = event.type === "focus" ? FocusState.FOCUS : FocusState.BLUR;
        configureList();
    }

    const configureList = () => {
        if (focusStateRef.current === FocusState.FOCUS) {
            document.addEventListener('keydown', initKeyboardListeners)
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
        valueRef.current = event.target.value
        updateDom()
    }

    const selectedCountry = (item: CountryInterface) => {
        selectedItemRef.current = item;
        valueRef.current = selectedItemRef.current?.name || ""
        updateDom()
    }

    const onMouseEnter = (item: CountryInterface) => {
        hoveredOptionIdRef.current = item.isoCode
        updateDom()
    }

    const initKeyboardListeners = (event: KeyboardEvent) => {
        // event.preventDefault();
        // event.stopPropagation();
        switch (event.key) {
            case "ArrowUp":
                changeHoveredItem(-1)
                break;
            case "ArrowDown":
                changeHoveredItem(1)
                break;
            case "Enter":
                selectedItemRef.current = countriesDials.find(item => item.isoCode === hoveredOptionIdRef.current)
                valueRef.current = selectedItemRef.current?.name || "";
                updateDom()
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
                id={"UNIQUE_ID"}
                onChange={onChange}
                value={state.value}
                placeholder={"Enter your country"}
            />
            <div className={`list ${state.focusState === FocusState.FOCUS}`}>
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