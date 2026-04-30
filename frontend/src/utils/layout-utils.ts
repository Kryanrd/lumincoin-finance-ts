import type { BalanceResponseType } from "../types/balance-response.type";
import type { HttpRequestResult } from "../types/http-request-result.type";
import { AuthUtils } from "./auth-utils";
import { HttpUtils } from "./http-utils";

export class LayoutUtils {
    private static setActiveMenuItem(currentPath: string): void {
        this.initMenu();
        const navLinks: NodeListOf<Element> = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('active');
            link.classList.add('text-primary-emphasis');
        });

        const collapseElement: HTMLElement | null = document.querySelector('#home-collapse');

        let activeLink: Element | undefined = Array.from(navLinks).find(link => link.getAttribute('href') === currentPath);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.classList.remove('text-primary-emphasis');
            return;
        }

        const submenuLinks: NodeListOf<Element> = document.querySelectorAll('.submenu-link');
        submenuLinks.forEach(link => link.classList.remove('active'));
        const activeSub: Element | undefined = Array.from(submenuLinks).find(link => link.getAttribute('href') === currentPath);
        if (activeSub) {
            if (collapseElement) {
                collapseElement.classList.add('show');
            }
            activeSub.classList.add('active');
            const parentBtn: HTMLElement | null = document.querySelector('#categoriesGroup .btn-toggle');
            if (parentBtn) parentBtn.classList.add('active');
        }
    }

    private static initMenu(): void {
        const toggleButton: HTMLElement | null = document.querySelector('.btn-toggle');
        const collapseElement: HTMLElement | null = document.querySelector('#home-collapse');
        const parentGroup: HTMLElement | null = document.querySelector('#categoriesGroup');

        if (toggleButton && collapseElement && parentGroup) {
            collapseElement.addEventListener('shown.bs.collapse', function () {
                toggleButton.classList.add('active');
                parentGroup.classList.add('open');
            });
            collapseElement.addEventListener('hidden.bs.collapse', function () {
                toggleButton.classList.remove('active');
                parentGroup.classList.remove('open');
            });
            if (collapseElement.classList.contains('show')) {
                toggleButton.classList.add('active');
                parentGroup.classList.add('open');
            }
        }

        this.initPopup();
    }

    private static initPopup() {
        const overlay: HTMLElement | null = document.getElementById('layoutOverlay');
        const popup: HTMLElement | null = document.getElementById('layoutPopup');
        const logoutBtn: HTMLElement | null = document.getElementById('logout-btn');
        const cancelBtn: HTMLElement | null = document.getElementById('cancelLogout');

        const openPopup = () => {
            if (overlay && popup) {
                overlay.style.display = 'block';
                popup.style.display = 'block';
                popup.classList.add('show');
                overlay.classList.add('show');
            }
        };

        const closePopup = () => {
            if (overlay && popup) {
                overlay.style.display = 'none';
                popup.style.display = 'none';
                popup.classList.remove('show');
                overlay.classList.remove('show');
            }
        };

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openPopup();
            });
        }
        if (overlay) overlay.addEventListener('click', closePopup);

        if (popup) popup.addEventListener('click', (e) => e.stopPropagation());

        if (cancelBtn) cancelBtn.addEventListener('click', closePopup);
    }

    public static async updateBalance(openNewRoute: Function): Promise<{ redirected: boolean }> {
        const balanceElement: HTMLElement | null = document.getElementById('balance');
        const result: HttpRequestResult<BalanceResponseType> = await HttpUtils.request('/balance');
        if (result.redirect) {
            await openNewRoute(result.redirect);
            return { redirected: true };
        }

        if (result.error || !result.response || !result.response.balance) {
            if (balanceElement) {
                balanceElement.innerText = `0 $`;
            }
            return { redirected: false };
        }
        if (balanceElement) {
            balanceElement.innerText = `${result.response.balance}$`;
        }
        return { redirected: false };
    }

    private static updateUserInfo(): void {
        const userInfoElement: HTMLElement | null = document.getElementById('user');
        if (!userInfoElement) return;
        const userInfo: string | null = AuthUtils.getAuthInfo(AuthUtils.userInfoTokenKey);
        if (userInfo) {
            userInfoElement.innerText = JSON.parse(userInfo).name;
        }
    }

    public static async initLayout(currentPath: string, openNewRoute: Function) {
        const { redirected }: { redirected: boolean } = await this.updateBalance(openNewRoute);
        if (redirected) return;
        this.setActiveMenuItem(currentPath);
        this.updateUserInfo();
    }

}