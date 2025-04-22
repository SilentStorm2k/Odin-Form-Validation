import '../css/styles.css';
import { userForm } from './basicForm';

console.log('hello world');

const myForm = userForm(
    { heading: 'User Information' },
    [
        { name: 'email', 'option-text': 'Email', type: 'text' },
        { name: 'country', 'option-text': 'Country', type: 'text' },
        { name: 'postalCode', 'option-text': 'Postal Code', type: 'text' },
        { name: 'password', 'option-text': 'Password', type: 'password' },
        {
            name: 'confirmPassword',
            'option-text': 'Confirm password',
            type: 'password',
        },
    ],
    [
        {
            text: '',
            event: 'click',
            'event handler': async (e) => {
                e.preventDefault();
                const valid = await checkValidation();
                if (valid) console.log('High Five!!!');
                else console.log('You still got some filling out to do bud!');
            },
        },
    ],
);

const formElement = myForm.getElement();
document.body.appendChild(formElement);

const submitButton = formElement.querySelector('button');
const s1 = document.createElement('span');
s1.classList.add('circle1');
const s2 = document.createElement('span');
s2.classList.add('circle2');
const s3 = document.createElement('span');
s3.classList.add('circle3');
const s4 = document.createElement('span');
s4.classList.add('circle4');
const s5 = document.createElement('span');
s5.classList.add('circle5');
const s6 = document.createElement('span');
s6.classList.add('text');
s6.textContent = 'Submit';
submitButton?.append(s1, s2, s3, s4, s5, s6);

interface ErrorHelp {
    element: HTMLInputElement;
    message: string;
}

const emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//  can get this from the country api obj: obj[postal code][regex]
let postalCodeRegex: RegExp | null = null;

const email = formElement.querySelector(
    'input[name="email"]',
) as HTMLInputElement;

const country = formElement.querySelector(
    'input[name="country"]',
) as HTMLInputElement;

const postalCode = formElement.querySelector(
    'input[name="postalCode"]',
) as HTMLInputElement;

const password = formElement.querySelector(
    'input[name="password"',
) as HTMLInputElement;

const confirmPassword = formElement.querySelector(
    'input[name="confirmPassword"]',
) as HTMLInputElement;

const errorHelpMessages: ErrorHelp[] = [
    { element: email, message: 'Enter a valid email' },
    {
        element: country,
        message:
            'Must enter full country name, click submit or move to next item to verify',
    },
    {
        element: postalCode,
        message: `Must enter valid Postal code for country`,
    },
    {
        element: password,
        message:
            'Password must contain at least 8 characters including 1 capital, 1 lowercase, 1 special character',
    },
    { element: confirmPassword, message: 'Passwords must match' },
];

const errorMap = new Map<HTMLInputElement, number>();
errorMap.set(email, 0);
errorMap.set(country, 1);
errorMap.set(postalCode, 2);
errorMap.set(password, 3);
errorMap.set(confirmPassword, 4);

const currentError = new Set([1, 2, 3, 4, 0]);

function setInvalidClass(element: HTMLInputElement, valid: boolean) {
    const val = errorMap.get(element) as number;
    if (valid) {
        element.classList.remove('invalid');
        currentError.delete(val);
    } else {
        element.classList.add('invalid');
        currentError.add(val);
    }
    showError();
}

function checkEmail() {
    if (emailRegex.test(email.value)) return true;
    return false;
}

async function checkCountry() {
    const countryApiEndpoint = `https://restcountries.com/v3.1/name/${country.value.toLowerCase()}?fullText=true`;

    console.log('Hitting the REST counties api');
    if (country.value == '') return false;

    try {
        const response = await fetch(countryApiEndpoint);
        if (!response.ok) return false;
        const targetArray = await response.json();
        const target = targetArray[0];
        if (
            target.name.common.toLowerCase() == country.value.toLowerCase() ||
            target.name.official.toLowerCase() == country.value.toLowerCase()
        ) {
            postalCodeRegex = new RegExp('');
            if (target.postalCode.regex != null)
                postalCodeRegex = new RegExp(target.postalCode.regex);
            return true;
        }
    } catch (error: any) {
        console.error(`An unexpected error occurred: ${error}`);
    }
    return false;
}

function checkPostalCode() {
    if (postalCodeRegex?.test(postalCode.value)) return true;
    return false;
}

function checkPasswords() {
    if (password.value == confirmPassword.value && password.value != '')
        return true;
    return false;
}

function checkPasswordRequirement() {
    if (passwordRegex.test(password.value)) return true;
    return false;
}

async function initializeValidation() {
    setInvalidClass(email, checkEmail());
    setInvalidClass(country, await checkCountry());
    setInvalidClass(postalCode, checkPostalCode());
    setInvalidClass(password, checkPasswordRequirement());
    setInvalidClass(confirmPassword, checkPasswords());
    email.addEventListener('input', (e) => {
        setInvalidClass(email, checkEmail());
    });
    country.addEventListener('focusout', async (e) => {
        setInvalidClass(country, await checkCountry());
        setInvalidClass(postalCode, checkPostalCode());
    });
    postalCode.addEventListener('input', () => {
        setInvalidClass(postalCode, checkPostalCode());
    });
    password.addEventListener('input', () => {
        setInvalidClass(password, checkPasswordRequirement());
    });
    confirmPassword?.addEventListener('input', () => {
        setInvalidClass(confirmPassword, checkPasswords());
    });
}

const updateError = (showError: boolean, errorHelpItem: ErrorHelp) => {
    const inputElement = errorHelpItem.element;
    const errorHelpText = errorHelpItem.message;
    const errorElement = inputElement.nextSibling as HTMLSpanElement; // assuming that the error span element is next sibling to the input
    if (showError) {
        errorElement.textContent = errorHelpText;
        errorElement.classList.add('active');
    } else {
        errorElement.textContent = '';
        errorElement.classList.remove('active');
    }
};

const showError = () => {
    const errorToBeShown = Math.min(...currentError);
    for (let i = 0; i < errorHelpMessages.length; i++) {
        if (i == errorToBeShown) updateError(true, errorHelpMessages[i]);
        else updateError(false, errorHelpMessages[i]);
    }
};

async function checkValidation() {
    const isEmailValid = checkEmail();
    const isCountryValid = await checkCountry();
    const isPostalCodeValid = checkPostalCode();
    const isPasswordValid = checkPasswordRequirement();
    const arePasswordsSame = checkPasswords();
    setInvalidClass(email, isEmailValid);
    setInvalidClass(country, isCountryValid);
    setInvalidClass(postalCode, isPostalCodeValid);
    setInvalidClass(password, isPasswordValid);
    setInvalidClass(confirmPassword, arePasswordsSame);
    const valid = [
        isEmailValid,
        isCountryValid,
        isPostalCodeValid,
        isPasswordValid,
        arePasswordsSame,
    ];
    let firstErrorShown = false;
    for (let i = 0; i < valid.length; i++) {
        if (!valid[i] && !firstErrorShown) {
            updateError(true, errorHelpMessages[i]);
            firstErrorShown = true;
        } else updateError(false, errorHelpMessages[i]);
    }
    return (
        isEmailValid &&
        isCountryValid &&
        isPostalCodeValid &&
        isPasswordValid &&
        arePasswordsSame
    );
}

window.addEventListener('load', initializeValidation);
