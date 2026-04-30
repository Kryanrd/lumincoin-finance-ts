import type { HttpRequestResult } from "../../types/http-request-result.type";
import type { SignUpResponseType } from "../../types/signup-response.type";
import { AuthUtils } from "../../utils/auth-utils";
import { HttpUtils } from "../../utils/http-utils";

export class SignUp {
    private openNewRoute: Function;
    private nameElement: HTMLInputElement | null = null;
    private lastNameElement: HTMLInputElement | null = null;
    private emailElement: HTMLInputElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private passwordRepeatElement: HTMLInputElement | null = null;
    private commonErrorElement: HTMLElement | null = null;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.findElements();
        const processButton: HTMLElement | null = document.getElementById('process-button');
        if (processButton) {
            processButton.addEventListener('click', this.signUp.bind(this));
        }
    }

    private findElements() {
        this.nameElement = document.getElementById('name') as HTMLInputElement | null;
        this.lastNameElement = document.getElementById('last-name') as HTMLInputElement | null;
        this.emailElement = document.getElementById('email') as HTMLInputElement | null;
        this.passwordElement = document.getElementById('password') as HTMLInputElement | null;
        this.passwordRepeatElement = document.getElementById('password-repeat') as HTMLInputElement | null;
        this.commonErrorElement = document.getElementById('common-error');
    }


    private valifateForm(): boolean {
        let isValid: boolean = true;
        if (this.nameElement) {
            if (this.nameElement.value && this.nameElement.value.match(/^[А-ЯЁ][а-яё]*(?:\s[А-ЯЁ][а-яё]*)*$/)) {
                this.nameElement.classList.remove('is-invalid');
            } else {
                this.nameElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.lastNameElement) {
            if (this.lastNameElement.value && this.lastNameElement.value.match(/^[А-ЯЁ][а-яё]*(?:\s[А-ЯЁ][а-яё]*)*$/)) {
                this.lastNameElement.classList.remove('is-invalid');
            } else {
                this.lastNameElement.classList.add('is-invalid');
                isValid = false;
            }
        }
        if (this.emailElement) {
            if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
                this.emailElement.classList.remove('is-invalid');
            } else {
                this.emailElement.classList.add('is-invalid');
                isValid = false;
            }
        }
        if (this.passwordElement) {
            if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*[A-Z])(?=.*\d).{8,}$/)) {
                this.passwordElement.classList.remove('is-invalid');
            } else {
                this.passwordElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.passwordRepeatElement && this.passwordElement) {
            if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
                this.passwordRepeatElement.classList.remove('is-invalid');
            } else {
                this.passwordRepeatElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        return isValid;
    }

    private async signUp(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }

        if (this.valifateForm()) {
            if (this.nameElement && this.lastNameElement && this.emailElement && this.passwordElement && this.passwordRepeatElement && this.commonErrorElement) {
                const result: HttpRequestResult<SignUpResponseType> = await HttpUtils.request('/signup', "POST", false, {
                    name: this.nameElement.value,
                    lastName: this.lastNameElement.value,
                    email: this.emailElement.value,
                    password: this.passwordElement.value,
                    passwordRepeat: this.passwordRepeatElement.value,
                })

                if (result.error || !result.response || (result.response && (!result.response.user.id || !result.response.user.email || !result.response.user.name || !result.response.user.lastName))) {
                    this.commonErrorElement.style.display = 'block';
                    return;
                }
            }

            this.openNewRoute('/login');
        }
    }
}