interface FormDetails {
    heading: string;
}
interface FormOption {
    name: string;
    'option-text': string;
    type: string;
    [key: string]: any;
}

interface FormButton {
    text: string;
    event: keyof HTMLElementEventMap;
    'event handler': EventListener;
    [key: string]: any;
}

export function userForm(
    formDetails: FormDetails,
    formOptions: FormOption[],
    formButtons: FormButton[],
    noValidate: boolean = false,
) {
    const form = createFormDiv();
    const formDetailsHolder = document.createElement('div');
    const buttonHolder = document.createElement('div');
    const optionsHolder = document.createElement('div');
    let options: { [key: string]: FormOption } = {};
    let buttons: { [key: string]: FormButton } = {};
    let headingElement: HTMLHeadingElement | null = null;

    init();

    function init() {
        form.noValidate = noValidate;
        setInitialContent(formDetails);
        setInitialOptions(formOptions);
        setInitialButtons(formButtons);
        form.append(formDetailsHolder, optionsHolder, buttonHolder);
    }

    function setInitialContent(formDetails: FormDetails) {
        if (formDetails.heading) {
            headingElement = document.createElement('h2');
            headingElement.innerText = formDetails.heading;
            formDetailsHolder.appendChild(headingElement);
        }
    }

    function setInitialOptions(formOptions: FormOption[]) {
        formOptions.forEach((option) => {
            options[option['name']] = option;
            setOption(option);
        });
    }

    function setInitialButtons(formButtons: FormButton[]) {
        formButtons.forEach((buttonOption) => {
            buttons[buttonOption['text']] = buttonOption;
            setButton(buttonOption);
        });
    }

    function setOption(option: FormOption) {
        const optionHolder = document.createElement('div');
        optionHolder.classList.add('optionHolder');

        const optionLabel = document.createElement('label');
        const optionLabelSpan = document.createElement('span');
        const optionInput = document.createElement('input');
        const optionHelp = document.createElement('span');

        optionLabel.htmlFor = option['name'];
        optionLabelSpan.innerText = option['option-text'];
        optionInput.type = option['type'];
        optionInput.name = option['name'];
        optionHelp.ariaLive = 'polite';
        optionHelp.classList.add('error');

        optionLabel.appendChild(optionLabelSpan);
        optionHolder.append(optionLabel, optionInput, optionHelp);
        optionsHolder.append(optionHolder);
    }

    function setButton(buttonOption: FormButton) {
        const button = document.createElement('button');
        button.innerText = buttonOption['text'];
        button.addEventListener(
            buttonOption['event'],
            buttonOption['event handler'],
        );
        buttonHolder.appendChild(button);
    }

    function createFormDiv(): HTMLFormElement {
        const div = document.createElement('form');
        return div;
    }

    function getElement(): HTMLFormElement {
        return form;
    }

    function addOption(newOption: FormOption) {
        if (!options[newOption.name]) {
            options[newOption.name] = newOption;
            setOption(newOption);
        } else {
            console.warn(`Option with name "${newOption.name}" already exits`);
        }
    }

    function updateOption(
        optionName: string,
        updateOption: Partial<FormOption>,
    ) {
        if (options[optionName]) {
            options[optionName] = { ...options[optionName], ...updateOption };
            const existingOptionsDiv = optionsHolder.querySelector(
                `div.optionHolder label[for="${optionName}"]`,
            )?.parentElement;
            const existingLabel = existingOptionsDiv?.querySelector('label');
            const existingInput = existingOptionsDiv?.querySelector('input');
            if (existingLabel && existingInput && existingOptionsDiv) {
                if (updateOption['option-text'] !== undefined)
                    existingLabel.querySelector('span')!.innerText =
                        updateOption['option-text'];
                if (updateOption['type'] !== undefined)
                    existingInput.type = updateOption['type'];
            } else
                console.warn(`Option with name "${optionName} does not exist"`);
        }
    }

    function removeOption(optionName: string) {
        if (options[optionName]) {
            delete options[optionName];
            const existingOptionsDiv = optionsHolder.querySelector(
                `div.optionHolder label[for="${optionName}"]`,
            )?.parentElement;

            if (existingOptionsDiv)
                optionsHolder.removeChild(existingOptionsDiv);
        } else console.warn(`Option with name "${optionName}" not found`);
    }

    function addButton(newButton: FormButton) {
        if (!buttons[newButton.text]) {
            buttons[newButton.text] = newButton;
            setButton(newButton);
        } else {
            console.warn(
                `Button with text "${newButton.text}" already exists.`,
            );
        }
    }

    function updateButton(
        buttonText: string,
        updatedButton: Partial<FormButton>,
    ) {
        if (buttons[buttonText]) {
            buttons[buttonText] = { ...buttons[buttonText], ...updatedButton };
            const existingButton = buttonHolder.querySelector(
                `button:contains("${buttonText}")`,
            ) as HTMLButtonElement;
            if (existingButton) {
                if (updatedButton.text !== undefined) {
                    existingButton.innerText = updatedButton.text;
                    // Consider updating the key in the 'buttons' object if the text changes
                }
                if (
                    updatedButton.event !== undefined &&
                    updatedButton['event handler'] !== undefined
                ) {
                    const oldHandler = buttons[buttonText]['event handler'];
                    existingButton.removeEventListener(
                        buttons[buttonText].event,
                        oldHandler,
                    );
                    existingButton.addEventListener(
                        updatedButton.event,
                        updatedButton['event handler'],
                    );
                }
                // Handle other properties as needed
            }
        } else {
            console.warn(`Button with text "${buttonText}" not found.`);
        }
    }

    function removeButton(buttonText: string) {
        if (buttons[buttonText]) {
            const buttonToRemove = buttonHolder.querySelector(
                `button:contains("${buttonText}")`,
            );
            if (buttonToRemove) {
                buttonHolder.removeChild(buttonToRemove);
                delete buttons[buttonText];
            }
        } else {
            console.warn(`Button with text "${buttonText}" not found.`);
        }
    }

    function setHeading(newHeading: string) {
        if (headingElement) {
            headingElement.innerText = newHeading;
        } else {
            headingElement = document.createElement('h2');
            headingElement.innerText = newHeading;
            formDetailsHolder.prepend(headingElement); // Add to the top if it didn't exist
        }
        // Update the FormDetails object as well
        formDetails.heading = newHeading;
    }
    return {
        getElement,
        addOption,
        updateOption,
        removeOption,
        addButton,
        updateButton,
        removeButton,
        setHeading,
    };
}
