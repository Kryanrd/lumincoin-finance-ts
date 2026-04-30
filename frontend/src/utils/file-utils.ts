export class FileUtils {
    public static loadPageScript(src: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve('Script Loaded: ' + src);
            script.onerror = () => reject(new Error('Script load error for ' + src));
            document.body.appendChild(script);
        })
    }

    public static loadPageStyle(src: string, insertBeforeElement: HTMLElement | null): void {
        const link: HTMLLinkElement | null = document.createElement('link');
        if (link) {
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = src;
            document.head.insertBefore(link, insertBeforeElement);
        }
    }

}