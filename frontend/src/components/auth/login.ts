import type { HttpRequestResult } from "../../types/http-request-result.type";
import type { LoginResponseType } from "../../types/login-response.type";
import { AuthUtils } from "../../utils/auth-utils";
import { HttpUtils } from "../../utils/http-utils";

export class Login {
    private openNewRoute: Function;
    private emailElement: HTMLInputElement | null = null;
    private passwordElement: HTMLInputElement | null = null;
    private rememberMeElement: HTMLInputElement | null = null;
    private commonErrorElement: HTMLElement | null = null;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.findElements();
        const processButton: HTMLElement | null = document.getElementById('process-button');
        if (processButton) {
            processButton.addEventListener('click', this.login.bind(this));
        }
    }

    private findElements(): void {
        this.emailElement = document.getElementById('email') as HTMLInputElement | null;
        this.passwordElement = document.getElementById('password') as HTMLInputElement | null;
        this.rememberMeElement = document.getElementById('remember-me') as HTMLInputElement | null;
        this.commonErrorElement = document.getElementById('common-error');
    }

    private valifateForm(): boolean {
        let isValid: boolean = true;
        if (this.emailElement) {
            if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
                this.emailElement.classList.remove('is-invalid');
            } else {
                this.emailElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.passwordElement) {
            if (this.passwordElement.value) {
                this.passwordElement.classList.remove('is-invalid');
            } else {
                this.passwordElement.classList.add('is-invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    private async login(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }
        if (this.valifateForm()) {
            if (this.emailElement && this.passwordElement && this.rememberMeElement && this.commonErrorElement) {
                const result: HttpRequestResult<LoginResponseType> = await HttpUtils.request('/login', "POST", false, {
                    email: this.emailElement.value,
                    password: this.passwordElement.value,
                    rememberMe: this.rememberMeElement.checked
                });
                if (result.error || !result.response || (result.response && (!result.response.tokens.accessToken || !result.response.tokens.refreshToken || !result.response.user.name || !result.response.user.lastName || !result.response.user.id))) {
                    this.commonErrorElement.style.display = 'block';
                    return;
                }

                AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, { id: result.response.user.id, name: result.response.user.name + ' ' + result.response.user.lastName });
            }

            this.openNewRoute('/');

        }
    }
}