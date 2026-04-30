import { Login } from "./components/auth/login";
import { Logout } from "./components/auth/logout";
import { SignUp } from "./components/auth/signup";
import { ExpensesEdit } from "./components/expenses/expenses-edit";
import { Expenses } from "./components/expenses/expenses";
import { ExpensesCreate } from "./components/expenses/expenses-create";
import { IncomesExpenses } from "./components/incomes-expenses/incomes-expanses";
import { IncomesExpensesCreate } from "./components/incomes-expenses/incomes-expenses-create"
import { IncomesExpensesEdit } from "./components/incomes-expenses/incomes-expenses-edit";
import { IncomeEdit } from "./components/incomes/income-edit";
import { IncomesCreate } from "./components/incomes/incomes-create";
import { Incomes } from "./components/incomes/incomes";
import { MainPage } from "./components/main-page";
import { FileUtils } from "./utils/file-utils";
import { LayoutUtils } from "./utils/layout-utils";
import type { RouteType } from "./types/route.type";

export class Router {
    private titlePageElement: HTMLElement | null;
    private contentPageElement: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.initEvents();

        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/main-page.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new MainPage(this.openNewRoute.bind(this));
                },
                scripts: ['chart.umd.js']
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/pages/auth/login.html',
                useLayout: false,
                load: () => {
                    new Login(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/signup',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/auth/signup.html',
                useLayout: false,
                load: () => {
                    new SignUp(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/incomes-expenses',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/pages/incomes-expenses/incomes-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomesExpenses(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/incomes-expenses/create',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/pages/incomes-expenses/create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomesExpensesCreate(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/incomes-expenses/edit',
                title: 'Редактирование дохода/расхода',
                filePathTemplate: '/templates/pages/incomes-expenses/edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomesExpensesEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/incomes',
                title: 'Доходы',
                filePathTemplate: '/templates/pages/incomes/incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Incomes(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/incomes/create',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/incomes/create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomesCreate(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/incomes/edit',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/pages/incomes/edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/expenses/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expenses/edit',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/pages/expenses/edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expenses/create',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/pages/expenses/create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesCreate(this.openNewRoute.bind(this));
                },
            }
        ]
    }

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this))
    }

    public async openNewRoute(url: string): Promise<void> {
        const currentRoute: string = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(null, currentRoute);
    }

    private async clickHandler(e: Event): Promise<void> {
        let element: HTMLLinkElement | null = null;
        const target = e.target as HTMLElement | null;
        if (target?.nodeName === 'A') {
            element = target as HTMLLinkElement;
        } else if (target?.parentNode && (target.parentNode as HTMLElement).nodeName === 'A') {
            element = target.parentNode as HTMLLinkElement;
        }

        if (element) {
            e.preventDefault();
            const currentRoute: string = window.location.pathname;
            const url = element.href.replace(window.location.origin, '');
            if (!url || (currentRoute === url.replace('#', '')) || url.startsWith('javascript:void(0)')) {
                return;
            }

            await this.openNewRoute(url);
        }

    }

    private async activateRoute(e: Event | null = null, oldRoute: string | null = null): Promise<void> {
        if (oldRoute) {
            const currentRoute: RouteType | undefined = this.routes.find(item => item.route === oldRoute);
            if (currentRoute) {
                if (currentRoute.scripts && currentRoute.scripts.length > 0) {
                    currentRoute.scripts.forEach(script => {
                        const scriptElement: HTMLElement | null = document.querySelector(`script[src='/js/${script}']`);
                        if (scriptElement) {
                            scriptElement.remove();
                        }
                    });
                }
            }
        }
        const urlRoute: string = window.location.pathname;
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.scripts && newRoute.scripts.length > 0) {
                for (const script of newRoute.scripts) {
                    await FileUtils.loadPageScript('/js/' + script);
                }
            }

            if (newRoute.title) {
                if (this.titlePageElement) {
                    this.titlePageElement.innerText = newRoute.title + ' | Lumincoin Finance';
                }
            }

            if (newRoute.filePathTemplate) {
                let contentBlock: HTMLElement | null = this.contentPageElement;
                if (newRoute.useLayout && typeof newRoute.useLayout === 'string') {
                    if (this.contentPageElement) {
                        this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    }
                    contentBlock = document.getElementById('content-layout');
                } else {
                    document.body.classList.remove('sidebar-mini');
                    document.body.classList.remove('layout-fixed');
                }
                if (contentBlock) {
                    contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
                }
            }

            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

            if (newRoute.useLayout && typeof newRoute.useLayout === 'string') {
                await LayoutUtils.initLayout(newRoute.route, this.openNewRoute.bind(this));
            }

        } else {
            console.log('No route found');
            history.pushState({}, '', '/404');
            await this.activateRoute();
        }
    }
}