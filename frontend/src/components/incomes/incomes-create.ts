import type { CategoryResponseType } from "../../types/category-response.type";
import type { DefaultResponseType } from "../../types/default-response.type";
import type { HttpRequestResult } from "../../types/http-request-result.type";
import { HttpUtils } from "../../utils/http-utils";

export class IncomesCreate {
    private openNewRoute: Function;
    private incomeInput: HTMLInputElement | null = null;

    constructor(openNewRoute: Function) {
        this.openNewRoute = openNewRoute;
        this.incomeInput = document.getElementById('incomeInput') as HTMLInputElement | null;

        const cancelButton: HTMLElement | null = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.openNewRoute.bind(this, '/incomes'));
        }
        const createButton: HTMLElement | null = document.getElementById('createButton');
        if (createButton) {
            createButton.addEventListener('click', this.saveIncomes.bind(this));
        }
    }

    private validateFields(): boolean {
        let isValid: boolean = true;
        if (this.incomeInput) {
            if (this.incomeInput.value) {
                this.incomeInput.classList.remove('is-invalid');
            } else {
                this.incomeInput.classList.add('is-invalid');
                isValid = false;
            }
        }

        return isValid;
    }

    private async saveIncomes(e: Event): Promise<void> {
        e.preventDefault();
        if (this.validateFields()) {
            if (this.incomeInput) {
                const createData: any = {
                    title: this.incomeInput.value
                }

                const result: HttpRequestResult<CategoryResponseType | DefaultResponseType> = await HttpUtils.request('/categories/income', 'POST', true, createData);

                if (result.redirect || result.error || !result.response || (result.response && ((result.response as DefaultResponseType).error || !(result.response as CategoryResponseType).id || !(result.response as CategoryResponseType).title))) {
                    alert('Возникла ошибка при создании расхода. Обратитесь в поддержку.')
                    if (result.redirect) {
                        this.openNewRoute('/login');
                    }
                }
            }
            this.openNewRoute('/incomes');
        }
    }

}